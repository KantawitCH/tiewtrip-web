import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Icons } from '../../components/Icons';
import { Bill, Currency, Participant } from '../../types';

interface FinanceTabProps {
  bills: Bill[];
  currency: Currency;
  participants: Participant[];
  onAddBill: () => void;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  bills,
  currency,
  participants,
  onAddBill,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card className="p-6 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Total Expenses</h2>
          <p className="text-slate-500 text-sm">Transparent billing for the whole trip.</p>
        </div>
        <div className="text-right">
          <span className="block text-4xl font-bold tracking-tight text-indigo-600">
            {currency} {bills.reduce((acc, b) => acc + b.amount, 0).toLocaleString()}
          </span>
          <span className="text-slate-400 text-xs">{bills.length} bills recorded</span>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900">Recent Transactions</h3>
        <Button onClick={onAddBill} className="gap-2">
          <Icons.Wallet className="w-4 h-4" /> Add Bill
        </Button>
      </div>

      <div className="space-y-3">
        {bills.map((bill) => (
          <Card key={bill.id} className="p-4 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <Icons.Receipt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{bill.title}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  Paid by <span className="font-medium text-slate-700">{participants.find(p => p.userId === bill.paidByUserId)?.name}</span> • {bill.date}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="block font-bold text-slate-900">{currency} {bill.amount.toLocaleString()}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{bill.splitMethod} Split</span>
            </div>
          </Card>
        ))}
        {bills.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-500">No bills recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
