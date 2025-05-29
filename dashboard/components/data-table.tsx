"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useData } from "@/context/data-context"

interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DataTable({ className, ...props }: DataTableProps) {
  const { data } = useData()

  // Se não houver dados, mostrar mensagem
  if (!data || data.length === 0) {
    return (
      <Card className={cn("", className)} {...props}>
        <CardHeader>
          <CardTitle>Dados da Planilha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Carregue um arquivo XLSX para visualizar os dados.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Limitar a 10 registros para a tabela
  const tableData = data.slice(0, 10).map((item) => {
    // Criar uma cópia do item sem a propriedade Timestamp
    const { Timestamp, ...rest } = item
    return rest
  })

  // Obter as colunas da primeira linha de dados (excluindo Timestamp)
  const columns = Object.keys(tableData[0])

  return (
    <Card className={cn("", className)} {...props}>
      <CardHeader>
        <CardTitle>Dados da Planilha</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column}`}>{row[column]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
