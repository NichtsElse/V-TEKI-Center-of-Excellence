/**
 * Purpose: Review invoice payments and verification status for the local MVP admin flow.
 * Used by: Admin route `/admin/payments`.
 * Main dependencies: Local app client, React Query mutations, shared table components, and shadcn dialog controls.
 * Public/main functions: Default `AdminPayments` page export.
 * Important side effects: Updates local payment verification status and admin notes.
 */
import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export default function AdminPayments() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: payments = [], isLoading } = useQuery({ queryKey: ['payments'], queryFn: () => appClient.entities.Payment.list('-created_date') });
  const paidCount = payments.filter((payment) => payment.status === 'paid').length;
  const issuedInvoices = payments.filter((payment) => payment.invoice_status === 'issued').length;
  const totalPaid = payments.filter((payment) => payment.status === 'paid').reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const updated = await appClient.entities.Payment.update(id, data);
      if (updated.registration_id && data.status) {
        await appClient.entities.Registration.update(updated.registration_id, {
          payment_status: data.status,
        });
      }
      return updated;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); setDialogOpen(false); toast({ title: 'Invoice payment updated' }); },
  });

  const verifyPayment = (payment) => {
    setSelected({
      ...payment,
      status: 'paid',
      invoice_status: 'paid',
      verified_date: new Date().toISOString().split('T')[0],
      payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
    });
    setDialogOpen(true);
  };

  const columns = [
    { header: 'Invoice', cell: (r) => <span className="font-medium font-mono text-xs">{r.invoice_number || '-'}</span> },
    { header: 'Participant', accessor: 'participant_name' },
    { header: 'Program', accessor: 'program_name' },
    { header: 'Organization', cell: (r) => <span className="text-xs">{r.organization_name || '-'}</span> },
    { header: 'Amount', cell: (r) => `IDR ${(r.amount || 0).toLocaleString()}` },
    { header: 'Invoice', cell: (r) => <StatusBadge status={r.invoice_status || 'issued'} /> },
    { header: 'Method', cell: (r) => <span className="text-xs capitalize">{r.payment_method?.replace(/_/g, ' ') || '-'}</span> },
    { header: 'Date', cell: (r) => r.payment_date ? format(new Date(r.payment_date), 'MMM d, yyyy') : '-' },
    { header: 'Payment', cell: (r) => <StatusBadge status={r.status} /> },
    { header: '', cell: (r) => r.status === 'pending' && (
      <Button variant="ghost" size="sm" className="h-7 text-xs text-success" onClick={(e) => { e.stopPropagation(); verifyPayment(r); }}>
        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verify
      </Button>
    )},
  ];

  return (
    <div>
      <PageHeader title="Payments" subtitle={`${payments.length} invoice payment records`} />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Paid Payments</p>
          <p className="mt-2 text-2xl font-bold font-heading">{paidCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Open Invoices</p>
          <p className="mt-2 text-2xl font-bold font-heading">{issuedInvoices}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Paid</p>
          <p className="mt-2 text-2xl font-bold font-heading">IDR {(totalPaid / 1000000).toFixed(1)}M</p>
        </div>
      </div>
      <div className="mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Use this queue to confirm payment proofs, settle invoice status, and unlock the next enrollment steps for each participant or corporate group.
      </div>
      <DataTable columns={columns} data={payments} isLoading={isLoading} emptyMessage="No payments found." />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Verify Invoice Payment</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Invoice:</span> <span className="font-medium ml-1">{selected.invoice_number}</span></div>
                <div><span className="text-muted-foreground">Amount:</span> <span className="font-medium ml-1">IDR {(selected.amount || 0).toLocaleString()}</span></div>
                <div><span className="text-muted-foreground">Participant:</span> <span className="font-medium ml-1">{selected.participant_name}</span></div>
                <div><span className="text-muted-foreground">Organization:</span> <span className="font-medium ml-1">{selected.organization_name || '-'}</span></div>
                <div><span className="text-muted-foreground">Reference:</span> <span className="font-medium ml-1">{selected.payment_reference || '-'}</span></div>
                <div><span className="text-muted-foreground">Verified:</span> <span className="font-medium ml-1">{selected.verified_date || '-'}</span></div>
              </div>
              <div><Label>Invoice Status</Label>
                <Select value={selected.invoice_status || 'issued'} onValueChange={v => setSelected({...selected, invoice_status: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Payment Status</Label>
                <Select value={selected.status} onValueChange={v => setSelected({...selected, status: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem><SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem><SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={selected.notes || ''} onChange={e => setSelected({...selected, notes: e.target.value})} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate({ id: selected.id, data: { status: selected.status, invoice_status: selected.invoice_status, notes: selected.notes, verified_date: selected.verified_date, payment_date: selected.payment_date } })} className="bg-secondary hover:bg-secondary/90 text-white">
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
