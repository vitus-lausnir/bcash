'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { createDeal, updateDeal } from '@/app/actions/deals'
import { Deal, Stage } from '@/lib/types'

const dealSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  stage: z.enum(['very_likely', 'hot', 'medium', 'long_shot', 'confirmed', 'lost']),
  amount: z.number().positive('Amount must be positive'),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
  contactPerson: z.string().optional(),
})

type DealFormData = z.infer<typeof dealSchema>

interface AddDealModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal?: Deal // If provided, we're editing
  onSuccess?: () => void
}

const stageOptions: { value: Stage; label: string; color: string }[] = [
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500' },
  { value: 'very_likely', label: 'Very Likely', color: 'bg-blue-500' },
  { value: 'hot', label: 'Hot', color: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'bg-purple-500' },
  { value: 'long_shot', label: 'Long Shot', color: 'bg-gray-500' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500' },
]

export function AddDealModal({ open, onOpenChange, deal, onSuccess }: AddDealModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    deal?.expectedCloseDate ? new Date(deal.expectedCloseDate) : undefined
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: deal ? {
      name: deal.name,
      stage: deal.stage,
      amount: deal.amount,
      expectedCloseDate: deal.expectedCloseDate,
      notes: deal.notes,
      contactPerson: deal.contactPerson,
    } : {
      stage: 'medium',
    },
  })

  const stage = watch('stage')

  const onSubmit = async (formData: DealFormData) => {
    setIsSubmitting(true)
    try {
      let result
      if (deal) {
        result = await updateDeal(deal.id, formData)
      } else {
        result = await createDeal(formData)
      }

      if (result.success) {
        reset()
        setSelectedDate(undefined)
        onOpenChange(false)
        onSuccess?.()
      } else {
        alert(result.error || 'Failed to save deal')
      }
    } catch (error) {
      alert('Failed to save deal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setValue('expectedCloseDate', date.toISOString())
      setShowCalendar(false)
    }
  }

  const formatAmount = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '')
    // Format with thousand separators
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{deal ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Deal Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Deal Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Arctic Fish Q2"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Amount and Stage - side by side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ISK) *</Label>
              <Input
                id="amount"
                type="text"
                placeholder="1,000,000"
                {...register('amount', {
                  setValueAs: (v) => {
                    const parsed = parseFloat(v.replace(/,/g, ''))
                    return isNaN(parsed) ? 0 : parsed
                  },
                })}
                onChange={(e) => {
                  e.target.value = formatAmount(e.target.value)
                }}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            {/* Stage */}
            <div className="space-y-2">
              <Label htmlFor="stage">Stage *</Label>
              <Select
                value={stage}
                onValueChange={(value) => setValue('stage', value as Stage)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expected Close Date */}
          <div className="space-y-2">
            <Label>Expected Close Date</Label>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
              </Button>
              {showCalendar && (
                <div className="border rounded-md p-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </div>
              )}
            </div>
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              placeholder="e.g., Bjorn"
              {...register('contactPerson')}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              rows={4}
              {...register('notes')}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : deal ? 'Save Changes' : 'Create Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
