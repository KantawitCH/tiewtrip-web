"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTripStore, Expense } from '@/lib/store';
import { SplitMethod } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Receipt, ArrowRightLeft, ChevronDown, ChevronUp, CheckCircle2, DollarSign, Equal, Percent, PieChart } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SPLIT_METHODS: { value: SplitMethod; label: string; icon: React.ElementType }[] = [
  { value: 'equal', label: 'Equal', icon: Equal },
  { value: 'exact', label: 'Exact', icon: DollarSign },
  { value: 'percentage', label: '%', icon: Percent },
  { value: 'shares', label: 'Shares', icon: PieChart },
];

function getParticipantShare(expense: Expense, participantId: string): number {
  if (!expense.participantIds.includes(participantId)) return 0;
  switch (expense.splitMethod) {
    case 'equal':
      return expense.amount / expense.participantIds.length;
    case 'exact':
      return expense.customSplits?.[participantId] ?? 0;
    case 'percentage':
      return expense.amount * (expense.customSplits?.[participantId] ?? 0) / 100;
    case 'shares': {
      const total = Object.values(expense.customSplits ?? {}).reduce((a, b) => a + b, 0);
      return total > 0 ? expense.amount * (expense.customSplits?.[participantId] ?? 0) / total : 0;
    }
  }
}

// Pairwise balance: positive = participantA is owed by participantB (B owes A)
function getPairwiseBalance(
  expenses: Expense[],
  settlements: { fromParticipantId: string; toParticipantId: string; amount: number }[],
  participantA: string,
  participantB: string
): number {
  let net = 0;

  for (const expense of expenses) {
    if (expense.isPaid) continue;
    if (!expense.participantIds.includes(participantA) && !expense.participantIds.includes(participantB)) continue;

    const shareB = getParticipantShare(expense, participantB);
    const shareA = getParticipantShare(expense, participantA);

    // A paid, B was involved → B owes A their share
    if (expense.paidByParticipantId === participantA && expense.participantIds.includes(participantB)) {
      net += shareB;
    }
    // B paid, A was involved → A owes B their share
    if (expense.paidByParticipantId === participantB && expense.participantIds.includes(participantA)) {
      net -= shareA;
    }
  }

  // Settlements: fromParticipantId paid toParticipantId
  for (const s of settlements) {
    if (s.fromParticipantId === participantB && s.toParticipantId === participantA) {
      net -= s.amount;
    }
    if (s.fromParticipantId === participantA && s.toParticipantId === participantB) {
      net += s.amount;
    }
  }

  return net;
}

export default function MoneyPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  const trip = useTripStore((state) => state.trips.find((t) => t.id === tripId));
  const expenses = useTripStore((state) => state.expenses).filter((e) => e.tripId === tripId);
  const participants = useTripStore((state) => state.participants).filter((p) => p.tripId === tripId);
  const settlements = useTripStore((state) => state.settlements).filter((s) => s.tripId === tripId);
  const addExpense = useTripStore((state) => state.addExpense);
  const deleteExpense = useTripStore((state) => state.deleteExpense);
  const markExpensePaid = useTripStore((state) => state.markExpensePaid);
  const addSettlement = useTripStore((state) => state.addSettlement);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<{ title: string; amount: string; currency: string; paidByParticipantId: string }>({
    title: '',
    amount: '',
    currency: 'USD',
    paidByParticipantId: '',
  });
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [splits, setSplits] = useState<Record<string, number>>({});
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
  const [expandedPairs, setExpandedPairs] = useState<Set<string>>(new Set());

  if (!trip) return null;

  const getParticipantName = (id: string) => participants.find(p => p.id === id)?.name || 'Unknown';

  const openAddDialog = () => {
    const allIds = participants.map(p => p.id);
    setSelectedIds(allIds);
    setSplits({});
    setSplitMethod('equal');
    setNewExpense({ title: '', amount: '', currency: 'USD', paidByParticipantId: '' });
    setIsAddOpen(true);
  };

  const toggleParticipant = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(x => x !== id);
        setSplits(s => { const c = { ...s }; delete c[id]; return c; });
        return next;
      }
      return [...prev, id];
    });
  };

  const handleAddExpense = () => {
    const amount = Number(newExpense.amount);
    if (!newExpense.title || !amount || !newExpense.paidByParticipantId) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Select at least one participant");
      return;
    }

    if (splitMethod === 'exact') {
      const sum = selectedIds.reduce((a, id) => a + (splits[id] ?? 0), 0);
      if (Math.abs(sum - amount) > 0.01) {
        toast.error(`Exact amounts must sum to $${amount.toFixed(2)} (currently $${sum.toFixed(2)})`);
        return;
      }
    }
    if (splitMethod === 'percentage') {
      const sum = selectedIds.reduce((a, id) => a + (splits[id] ?? 0), 0);
      if (Math.abs(sum - 100) > 0.01) {
        toast.error(`Percentages must sum to 100% (currently ${sum.toFixed(1)}%)`);
        return;
      }
    }
    if (splitMethod === 'shares') {
      const allHaveShares = selectedIds.every(id => (splits[id] ?? 0) > 0);
      if (!allHaveShares) {
        toast.error("All selected participants must have at least 1 share");
        return;
      }
    }

    addExpense({
      tripId,
      title: newExpense.title,
      amount,
      currency: newExpense.currency || 'USD',
      paidByParticipantId: newExpense.paidByParticipantId,
      participantIds: selectedIds,
      splitMethod,
      customSplits: splitMethod === 'equal' ? undefined : splits,
      date: new Date().toISOString(),
    });
    toast.success("Expense added");
    setIsAddOpen(false);
  };

  const handleSettleUp = (otherId: string, net: number) => {
    const viewerId = selectedParticipantId;
    const from = net < 0 ? viewerId : otherId;
    const to = net < 0 ? otherId : viewerId;
    addSettlement({
      tripId,
      fromParticipantId: from,
      toParticipantId: to,
      amount: Math.abs(net),
      currency: 'USD',
      date: new Date().toISOString(),
    });
    toast.success("Settled up!");
  };

  const togglePairExpand = (id: string) => {
    setExpandedPairs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getPairExpenses = (viewerId: string, otherId: string) => {
    return expenses.filter(e => {
      if (e.isPaid) return false;
      const hasViewer = e.participantIds.includes(viewerId);
      const hasOther = e.participantIds.includes(otherId);
      const payerIsRelevant = e.paidByParticipantId === viewerId || e.paidByParticipantId === otherId;
      return (hasViewer || hasOther) && payerIsRelevant;
    });
  };

  const viewer = participants.find(p => p.id === selectedParticipantId);
  const otherParticipants = participants.filter(p => p.id !== selectedParticipantId);

  // Hero stats
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const myShare = viewer
    ? expenses.reduce((sum, e) => sum + getParticipantShare(e, viewer.id), 0)
    : null;
  const myNetBalance = viewer
    ? otherParticipants.reduce((sum, other) =>
        sum + getPairwiseBalance(expenses, settlements, viewer.id, other.id), 0)
    : null;

  const balanceLabel = myNetBalance === null ? '—'
    : Math.abs(myNetBalance) < 0.01 ? 'Settled'
    : myNetBalance > 0 ? `+$${myNetBalance.toFixed(2)}`
    : `-$${Math.abs(myNetBalance).toFixed(2)}`;

  const balanceAccent = myNetBalance === null || Math.abs(myNetBalance) < 0.01
    ? 'bg-soft' : myNetBalance > 0 ? 'bg-mint' : 'bg-coral';

  const balanceTextColor = myNetBalance === null || Math.abs(myNetBalance) < 0.01
    ? 'text-muted' : myNetBalance > 0 ? 'text-ink' : 'text-coral';

  // For dialog summary display
  const dialogAmount = Number(newExpense.amount) || 0;
  const equalShare = selectedIds.length > 0 ? dialogAmount / selectedIds.length : 0;
  const exactRemaining = dialogAmount - selectedIds.reduce((a, id) => a + (splits[id] ?? 0), 0);
  const pctRemaining = 100 - selectedIds.reduce((a, id) => a + (splits[id] ?? 0), 0);
  const totalShares = Object.values(splits).reduce((a, b) => a + b, 0);

  const splitMethodBadgeLabel: Record<SplitMethod, string> = {
    equal: 'equal',
    exact: 'exact $',
    percentage: '%',
    shares: 'shares',
  };

  const expenseCount = expenses.length;
  const expensePlural = expenseCount !== 1 ? 's' : '';

  return (
    <div className="max-w-6xl flex flex-col lg:flex-row gap-8 pb-12">

      {/* ── SIDEBAR ── */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="flex lg:flex-col gap-3 flex-wrap lg:flex-nowrap">
          {/* Section title */}
          <div className="w-full flex items-center justify-between mb-1">
            <span className="font-display font-bold text-ink text-lg">My Balance</span>
          </div>

          {/* Viewing as selector */}
          <div className="w-full flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-muted flex-shrink-0" />
            <Select value={selectedParticipantId} onValueChange={setSelectedParticipantId}>
              <SelectTrigger className="flex-1 h-9 text-sm rounded-xl border-soft bg-white">
                <SelectValue placeholder="Pick a participant" />
              </SelectTrigger>
              <SelectContent>
                {participants.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Balance cards or empty state */}
          {!viewer ? (
            <div className="w-full flex flex-col items-center justify-center h-32 text-center border-2 border-dashed border-soft rounded-2xl">
              <ArrowRightLeft className="w-8 h-8 text-muted mb-1.5" />
              <p className="text-xs text-muted">Select a participant to view their balances.</p>
            </div>
          ) : (
            <div className="w-full space-y-3">
              {otherParticipants.map(other => {
                const net = getPairwiseBalance(expenses, settlements, viewer.id, other.id);
                const isSettled = Math.abs(net) < 0.01;
                const viewerIsOwed = net > 0;
                const pairKey = [viewer.id, other.id].sort().join(':');
                const isExpanded = expandedPairs.has(pairKey);
                const pairExpenses = getPairExpenses(viewer.id, other.id);

                return (
                  <Card
                    key={other.id}
                    className={cn(
                      "border shadow-sm overflow-hidden",
                      isSettled
                        ? "border-soft"
                        : viewerIsOwed
                          ? "border-mint/60 bg-mint/20"
                          : "border-coral/50 bg-coral/[0.06]"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-ink",
                            isSettled ? "bg-soft" : viewerIsOwed ? "bg-mint/40" : "bg-coral/20"
                          )}>
                            {other.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-ink">{other.name}</p>
                            <p className={cn(
                              "text-xs font-mono font-bold",
                              isSettled ? "text-muted" : viewerIsOwed ? "text-ink font-bold" : "text-coral"
                            )}>
                              {isSettled
                                ? "Settled"
                                : viewerIsOwed
                                  ? `${other.name} owes you $${net.toFixed(2)}`
                                  : `You owe ${other.name} $${Math.abs(net).toFixed(2)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isSettled && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 bg-ink text-white hover:bg-ink/80 transition-colors rounded-full px-4 font-bold shadow-sm"
                              onClick={() => handleSettleUp(other.id, net)}
                            >
                              Settle Up
                            </Button>
                          )}
                          {pairExpenses.length > 0 && (
                            <button
                              onClick={() => togglePairExpand(pairKey)}
                              className="p-1 text-muted hover:text-ink transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {isExpanded && pairExpenses.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-soft space-y-1.5">
                          {pairExpenses.map(e => {
                            const share = getParticipantShare(e, viewer.id);
                            const paidByOther = e.paidByParticipantId === other.id;
                            return (
                              <div key={e.id} className="flex items-center justify-between text-xs">
                                <span className="text-muted">{e.title}</span>
                                <span className="font-mono font-medium text-ink">
                                  {paidByOther ? `${other.name} paid` : 'you paid'} · your share: ${share.toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN PANEL ── */}
      <div className="flex-1 bg-white/50 rounded-[32px] border border-soft p-6 md:p-8">

        {/* Hero stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Total Spent */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-soft p-4">
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-coral" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">Total Spent</p>
            <p className="text-2xl md:text-3xl font-black font-mono leading-none text-ink">${totalSpent.toFixed(2)}</p>
            <p className="text-[10px] text-muted mt-1.5">{expenseCount} expense{expensePlural}</p>
          </div>
          {/* My Share */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-soft p-4">
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-soft" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">My Share</p>
            <p className="text-2xl md:text-3xl font-black font-mono leading-none text-ink">
              {myShare !== null ? `$${myShare.toFixed(2)}` : '—'}
            </p>
            <p className="text-[10px] text-muted mt-1.5">
              {viewer ? `of ${expenseCount} expense${expensePlural}` : 'select a participant'}
            </p>
          </div>
          {/* My Balance */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-soft p-4">
            <div className={cn("absolute inset-x-0 bottom-0 h-[3px]", balanceAccent)} />
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">My Balance</p>
            <p className={cn("text-2xl md:text-3xl font-black font-mono leading-none", balanceTextColor)}>
              {balanceLabel}
            </p>
            <p className="text-[10px] text-muted mt-1.5">net across all debts</p>
          </div>
        </div>

        {/* Panel header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-display font-bold text-ink">Transactions</h2>
            <p className="text-muted text-sm mt-0.5">
              {expenseCount} transaction{expensePlural} · ${totalSpent.toFixed(2)} total
            </p>
          </div>
          <Button onClick={openAddDialog} className="rounded-full font-bold bg-mint text-ink shadow-lg shadow-mint/20 hover:bg-mint/90 px-6">
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
        </div>

        {/* Transactions */}
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-soft rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-mint/20 flex items-center justify-center mb-3">
              <Receipt className="w-8 h-8 text-ink" />
            </div>
            <p className="text-sm text-muted">No transactions yet.</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className={cn(
                    "flex flex-col gap-2 rounded-2xl border p-4 transition-colors",
                    expense.isPaid
                      ? "opacity-60 bg-soft/20 border-soft"
                      : "bg-white border-soft hover:border-coral/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-mint/20 flex items-center justify-center flex-shrink-0">
                        <Receipt className="w-4 h-4 text-ink" />
                      </div>
                      <div className="min-w-0">
                        <p className={cn("font-semibold text-sm text-ink truncate", expense.isPaid && "line-through text-muted")}>
                          {expense.title}
                        </p>
                        <p className="text-xs text-muted">
                          {getParticipantName(expense.paidByParticipantId)} · {format(new Date(expense.date), 'MMM d')}
                          {' · '}
                          <span className="font-mono uppercase tracking-wider">{splitMethodBadgeLabel[expense.splitMethod]}</span>
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "font-mono font-bold text-sm flex-shrink-0",
                      expense.isPaid ? "text-muted line-through" : "text-coral"
                    )}>
                      ${expense.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pl-12">
                    {expense.isPaid ? (
                      <button
                        onClick={() => markExpensePaid(expense.id, false)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-ink bg-mint/30 border border-mint/60 rounded px-2 py-0.5 hover:bg-mint/45 transition-colors font-mono"
                      >
                        <CheckCircle2 className="w-3 h-3" /> SETTLED
                      </button>
                    ) : (
                      <button
                        onClick={() => markExpensePaid(expense.id, true)}
                        className="text-xs font-bold bg-coral/10 text-coral border border-coral/30 rounded-full px-3 py-1 hover:bg-coral hover:text-white transition-colors"
                      >
                        Mark paid
                      </button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted hover:text-coral"
                      onClick={() => {
                        if (confirm('Delete expense?')) deleteExpense(expense.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted uppercase bg-ink/5 font-bold tracking-wider border-b border-soft">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Payer</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-right">Status</th>
                    <th className="px-6 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft">
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className={cn(
                        "group transition-colors border-l-2",
                        expense.isPaid
                          ? "border-l-mint opacity-50 bg-soft/20"
                          : "border-l-coral hover:bg-soft/30"
                      )}
                    >
                      <td className="px-6 py-4 font-mono text-muted text-xs whitespace-nowrap">
                        {format(new Date(expense.date), 'MMM d')}
                      </td>
                      <td className="px-6 py-4 font-medium text-ink">
                        <div className="flex items-center gap-2">
                          {expense.title}
                          <span className="font-mono text-[10px] text-muted bg-soft/60 rounded px-1 py-0.5 uppercase tracking-wider">
                            {splitMethodBadgeLabel[expense.splitMethod]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-mint/20 text-ink flex items-center justify-center text-[10px] font-bold">
                            {getParticipantName(expense.paidByParticipantId).charAt(0)}
                          </div>
                          <span className="text-xs text-muted truncate max-w-[80px]">
                            {getParticipantName(expense.paidByParticipantId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "font-mono font-bold text-sm",
                          expense.isPaid ? "text-muted line-through" : "text-coral"
                        )}>
                          ${expense.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {expense.isPaid ? (
                          <button
                            onClick={() => markExpensePaid(expense.id, false)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-ink bg-mint/30 border border-mint/60 rounded px-2 py-0.5 hover:bg-mint/45 transition-colors font-mono"
                          >
                            <CheckCircle2 className="w-3 h-3" /> SETTLED
                          </button>
                        ) : (
                          <button
                            onClick={() => markExpensePaid(expense.id, true)}
                            className="text-xs font-bold bg-coral/10 text-coral border border-coral/30 rounded-full px-3 py-1 hover:bg-coral hover:text-white transition-colors"
                          >
                            Mark paid
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted hover:text-coral opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            if (confirm('Delete expense?')) deleteExpense(expense.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl flex flex-col max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-mint/25 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-ink" />
              </div>
              <DialogTitle className="font-display text-xl">Add Expense</DialogTitle>
            </div>
          </DialogHeader>
          <div className="grid gap-4 px-6 py-4 overflow-y-auto flex-1 min-h-0">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Dinner at Mario's"
                value={newExpense.title}
                onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs text-muted uppercase tracking-wider font-bold">Amount</Label>
              <div className="flex items-center gap-2 bg-soft/50 rounded-2xl px-4 py-3 border border-soft focus-within:border-coral/60 focus-within:bg-coral/5 transition-colors">
                <input
                  type="text"
                  placeholder="USD"
                  className="w-14 text-2xl font-bold font-mono text-muted bg-transparent border-none outline-none uppercase"
                  value={newExpense.currency}
                  onChange={e => setNewExpense({ ...newExpense, currency: e.target.value.toUpperCase().slice(0, 3) })}
                />
                <input
                  type="number"
                  placeholder="0.00"
                  className="flex-1 text-3xl font-bold font-mono text-ink bg-transparent border-none outline-none placeholder:text-soft"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Paid By</Label>
              <Select value={newExpense.paidByParticipantId} onValueChange={val => setNewExpense({ ...newExpense, paidByParticipantId: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Split Method Tabs */}
            <div className="grid gap-2">
              <Label className="text-xs text-muted uppercase tracking-wider font-bold">Split Method</Label>
              <div className="grid grid-cols-4 gap-1.5 bg-soft/60 p-1 rounded-xl">
                {SPLIT_METHODS.map(m => {
                  const Icon = m.icon;
                  const active = splitMethod === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => { setSplitMethod(m.value); setSplits({}); }}
                      className={cn(
                        "flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs font-bold transition-all",
                        active
                          ? "bg-white text-coral shadow-sm"
                          : "text-muted hover:text-ink"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Participant Checklist */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted uppercase tracking-wider font-bold">Participants</Label>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIds(participants.map(p => p.id));
                    setSplits({});
                  }}
                  className="text-xs text-muted hover:text-ink underline underline-offset-2 transition-colors"
                >
                  Select All
                </button>
              </div>
              <div className="space-y-0.5 rounded-xl overflow-hidden bg-soft/30 p-1">
                {participants.map(p => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors",
                        isSelected ? "bg-coral/5" : "hover:bg-soft/60"
                      )}
                      onClick={() => toggleParticipant(p.id)}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors",
                        isSelected ? "bg-coral/20 text-coral" : "bg-soft text-muted"
                      )}>
                        {p.name.charAt(0)}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="sr-only"
                      />
                      <span className={cn("flex-1 text-sm font-medium", isSelected ? "text-ink" : "text-muted")}>
                        {p.name}
                      </span>
                      {isSelected && splitMethod === 'equal' && (
                        <span className="text-xs font-mono text-muted">
                          ${equalShare.toFixed(2)}
                        </span>
                      )}
                      {isSelected && splitMethod === 'exact' && (
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="w-24 h-7 text-xs font-mono text-right"
                          value={splits[p.id] ?? ''}
                          onClick={e => e.stopPropagation()}
                          onChange={e => setSplits(s => ({ ...s, [p.id]: Number(e.target.value) }))}
                        />
                      )}
                      {isSelected && splitMethod === 'percentage' && (
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Input
                            type="number"
                            placeholder="0"
                            className="w-20 h-7 text-xs font-mono text-right"
                            value={splits[p.id] ?? ''}
                            onChange={e => setSplits(s => ({ ...s, [p.id]: Number(e.target.value) }))}
                          />
                          <span className="text-xs text-muted">%</span>
                        </div>
                      )}
                      {isSelected && splitMethod === 'shares' && (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <Input
                            type="number"
                            placeholder="1"
                            min="1"
                            className="w-16 h-7 text-xs font-mono text-right"
                            value={splits[p.id] ?? ''}
                            onChange={e => setSplits(s => ({ ...s, [p.id]: Number(e.target.value) }))}
                          />
                          {totalShares > 0 && splits[p.id] > 0 && (
                            <span className="text-xs font-mono text-muted whitespace-nowrap">
                              = ${(dialogAmount * splits[p.id] / totalShares).toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress bar for exact/percentage */}
              {splitMethod === 'exact' && dialogAmount > 0 && (() => {
                const allocated = dialogAmount - exactRemaining;
                const pct = Math.min(100, (allocated / dialogAmount) * 100);
                const done = Math.abs(exactRemaining) < 0.01;
                return (
                  <div className="space-y-1">
                    <div className="h-1.5 bg-soft rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", done ? "bg-mint" : "bg-coral")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className={cn("text-xs font-mono text-right", done ? "text-mint" : "text-coral")}>
                      {done ? "✓ Fully allocated" : `$${exactRemaining.toFixed(2)} remaining`}
                    </p>
                  </div>
                );
              })()}
              {splitMethod === 'percentage' && (() => {
                const allocated = 100 - pctRemaining;
                const pct = Math.min(100, allocated);
                const done = Math.abs(pctRemaining) < 0.01;
                return (
                  <div className="space-y-1">
                    <div className="h-1.5 bg-soft rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", done ? "bg-mint" : "bg-coral")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className={cn("text-xs font-mono text-right", done ? "text-mint" : "text-coral")}>
                      {done ? "✓ Fully allocated" : `${pctRemaining.toFixed(1)}% remaining`}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-3 flex-shrink-0 border-t border-soft/60">
            <Button onClick={handleAddExpense} className="w-full bg-ink text-white hover:bg-ink/80 transition-colors rounded-full font-bold shadow-sm">
              Save Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
