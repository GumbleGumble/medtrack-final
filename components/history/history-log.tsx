"use client"

import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { DoseWithMedication, HistoryResponse } from "@/types/medication"

interface HistoryLogProps {
  data: HistoryResponse
  isLoading: boolean
  onPageChange: (page: number) => void
}

export function HistoryLog({
  data,
  isLoading,
  onPageChange,
}: HistoryLogProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (data.doses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No medication history found for the selected filters.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Medication</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Dose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.doses.map((dose) => (
              <TableRow key={dose.id}>
                <TableCell>
                  {format(new Date(dose.timestamp), "MMM d, yyyy h:mm a")}
                </TableCell>
                <TableCell>{dose.medication.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: dose.medication.group.color }}
                    />
                    {dose.medication.group.name}
                  </div>
                </TableCell>
                <TableCell>
                  {dose.medication.dosage} {dose.medication.unit}
                </TableCell>
                <TableCell>
                  <Badge variant={dose.skipped ? "destructive" : "default"}>
                    {dose.skipped ? "Skipped" : "Taken"}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {dose.notes || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data.doses.length} of {data.total} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={data.page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(data.page - 1)}
            disabled={data.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            Page {data.page} of {data.totalPages}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(data.page + 1)}
            disabled={data.page === data.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(data.totalPages)}
            disabled={data.page === data.totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-12 w-[200px]" />
      </div>
      <div className="border rounded-lg">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-3">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 