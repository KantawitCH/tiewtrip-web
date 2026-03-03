"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTripStore, Expense } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Receipt, User, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function MoneyPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const trip = useTripStore((state) => state.trips.find((t) => t.id === tripId));
  const expenses = useTripStore((state) => state.expenses).filter((e) => e.tripId === tripId);
  const participants = useTripStore((state) => state.participants).filter((p) => p.tripId === tripId);
  const addExpense = useTripStore((state) => state.addExpense);
  const deleteExpense = useTripStore((state) => state.deleteExpense);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    currency: 'USD',
    splitMethod: 'equal',
    participantIds: [],
  });

  if (!trip) return null;

  const handleAddExpense = () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.paidByParticipantId) {
      toast.error("Please fill in required fields");
      return;
    }

    // Default to all participants if none selected
    const involvedIds = newExpense.participantIds?.length ? newExpense.participantIds : participants.map(p => p.id);

    addExpense({
      tripId,
      title: newExpense.title,
      amount: Number(newExpense.amount),
      currency: newExpense.currency || 'USD',
      paidByParticipantId: newExpense.paidByParticipantId,
      participantIds: involvedIds,
      splitMethod: 'equal', // Simplified for now
      date: new Date().toISOString(),
    });

    toast.success("Expense added");
    setIsAddOpen(false);
    setNewExpense({ currency: 'USD', splitMethod: 'equal', participantIds: [] });
  };

  const getParticipantName = (id: string) => participants.find(p => p.id === id)?.name || 'Unknown';

  // Calculate Balances
  const balances: Record<string, number> = {};
  participants.forEach(p => balances[p.id] = 0);

  expenses.forEach(expense => {
    const paidBy = expense.paidByParticipantId;
    const amount = expense.amount;
    const splitCount = expense.participantIds.length;
    const splitAmount = amount / splitCount;

    // Payer gets positive balance (owed money)
    if (balances[paidBy] !== undefined) {
        balances[paidBy] += amount;
    }

    // Participants get negative balance (owe money)
    expense.participantIds.forEach(pId => {
        if (balances[pId] !== undefined) {
            balances[pId] -= splitAmount;
        }
    });
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Balances & Actions */}
      <div className="space-y-6">
         {/* Action Card */}
         <Card className="bg-mint text-ink border-none shadow-md">
            <CardContent className="p-6">
               <h3 className="font-bold text-lg mb-2">Trip Budget</h3>
               <p className="text-sm opacity-80 mb-6">Keep track of every penny. Settle up instantly.</p>
               <Button onClick={() => setIsAddOpen(true)} className="w-full bg-mint text-ink hover:bg-mint/90 font-bold shadow-lg shadow-mint/20">
                  <Plus className="w-4 h-4 mr-2" /> Add Expense
               </Button>
            </CardContent>
         </Card>

         {/* Balances List - Dense */}
         <Card className="border-soft shadow-sm">
            <CardHeader className="pb-3 border-b border-soft">
               <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-muted" /> Balances
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {participants.map((p) => {
                  const balance = balances[p.id] || 0;
                  const isOwed = balance > 0;
                  const isSettled = Math.abs(balance) < 0.01;

                  return (
                     <div key={p.id} className="flex justify-between items-center p-4 border-b border-soft last:border-0 hover:bg-soft/20 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-soft flex items-center justify-center text-xs font-bold text-ink">
                              {p.name.charAt(0)}
                           </div>
                           <span className="font-medium text-sm">{p.name}</span>
                        </div>
                        <div className={cn(
                           "font-mono font-bold text-sm",
                           isSettled ? "text-muted" : isOwed ? "text-mint-dark" : "text-coral"
                        )}>
                           {isSettled ? '—' : (isOwed ? `+$${balance.toFixed(2)}` : `-$${Math.abs(balance).toFixed(2)}`)}
                        </div>
                     </div>
                  );
               })}
            </CardContent>
         </Card>
      </div>

      {/* Right Column: Transaction Ledger */}
      <div className="lg:col-span-2">
         <Card className="border-soft shadow-sm h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-soft flex flex-row items-center justify-between">
               <CardTitle className="text-base font-bold">Transactions</CardTitle>
               <Badge variant="outline" className="font-mono text-xs">{expenses.length} items</Badge>
            </CardHeader>
            <div className="flex-1 overflow-y-auto p-0">
               {expenses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center opacity-60">
                     <Receipt className="w-12 h-12 text-muted mb-3" />
                     <p className="text-sm text-muted">No transactions yet.</p>
                  </div>
               ) : (
                  <table className="w-full text-sm text-left">
                     <thead className="text-xs text-muted uppercase bg-soft/30 font-medium">
                        <tr>
                           <th className="px-6 py-3">Date</th>
                           <th className="px-6 py-3">Description</th>
                           <th className="px-6 py-3">Payer</th>
                           <th className="px-6 py-3 text-right">Amount</th>
                           <th className="px-6 py-3 w-10"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-soft">
                        {expenses.map((expense) => (
                           <tr key={expense.id} className="hover:bg-soft/10 group transition-colors">
                              <td className="px-6 py-4 font-mono text-muted text-xs whitespace-nowrap">
                                 {format(new Date(expense.date), 'MMM d')}
                              </td>
                              <td className="px-6 py-4 font-medium text-ink">
                                 {expense.title}
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-soft flex items-center justify-center text-[10px] font-bold">
                                       {getParticipantName(expense.paidByParticipantId).charAt(0)}
                                    </div>
                                    <span className="text-xs text-muted truncate max-w-[80px]">
                                       {getParticipantName(expense.paidByParticipantId)}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right font-mono font-bold text-ink">
                                 ${expense.amount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                       if(confirm('Delete expense?')) deleteExpense(expense.id);
                                    }}
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
         </Card>
      </div>

      {/* Add Expense Dialog (Hidden) */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input 
                placeholder="e.g. Dinner at Mario's" 
                value={newExpense.title || ''}
                onChange={e => setNewExpense({...newExpense, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={newExpense.amount || ''}
                  onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Currency</Label>
                <Input 
                  value={newExpense.currency || 'USD'}
                  onChange={e => setNewExpense({...newExpense, currency: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Paid By</Label>
              <Select 
                onValueChange={val => setNewExpense({...newExpense, paidByParticipantId: val})}
              >
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
          </div>
          <DialogFooter>
            <Button onClick={handleAddExpense}>Save Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
