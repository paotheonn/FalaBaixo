"use client"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { UploadButton } from "@/components/upload-button"
import { DataCharts } from "@/components/data-charts"
import { DataSummary } from "@/components/data-summary"
import { DataProvider } from "@/context/data-context"

// Dados de exemplo para pré-carregar
const sampleData = [
  {
    Timestamp: "2025-05-10",
    Volume: 26.8,
    Status: "Normal",
    Sensibilid: 60,
    Mensager: "Não",
    "Tempo de Usuário/L": 0,
    Observação: "Padrão",
  },
  {
    Timestamp: "2025-05-10",
    Volume: 30.8,
    Status: "Normal",
    Sensibilid: 60,
    Mensager: "Não",
    "Tempo de Usuário/L": 0,
    Observação: "Padrão",
  },
  {
    Timestamp: "2025-05-10",
    Volume: 27.7,
    Status: "Normal",
    Sensibilid: 60,
    Mensager: "Não",
    "Tempo de Usuário/L": 0,
    Observação: "Padrão",
  },
  {
    Timestamp: "2025-05-10",
    Volume: 35.0,
    Status: "Normal",
    Sensibilid: 60,
    Mensager: "Não",
    "Tempo de Usuário/L": 0,
    Observação: "Padrão",
  },
  {
    Timestamp: "2025-05-10",
    Volume: 30.0,
    Status: "Normal",
    Sensibilid: 60,
    Mensager: "Não",
    "Tempo de Usuário/L": 0,
    Observação: "Padrão",
  },
  {
    Timestamp: "2025-05-10",
    Volume: 38.2,
    Status: "Normal",
    Sensibilid: 60,
    Mensager: "Não",
    "Tempo de Usuário/L": 0,
    Observação: "Padrão",
  },
  {
    Timestamp: "2025-05-10",
    Volume: 42.6,
    Status: "Normal",
    Sensibilid: 60,
    Mensager: "Não",
    "Tempo de Usuário/L": 1,
    Observação: "Padrão",
  },
  {
    Timestamp: "2025-05-10",
    Volume: 44.8,
    Status: "Normal",
    Sensibilid: 60,
    Mensager: "Não",
    "Tempo de Usuário/L": 0,
    Observação: "Padrão",
  },
  {
    Timestamp: "2025-05-10",
    Volume: 36.7,
    Status: "Normal",
    Sensibilid: 60,
    Mensager: "Não",
    "Tempo de Usuário/L": 0,
    Observação: "Padrão",
  },
]

export default function DashboardPage() {
  return (
    <DataProvider>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              <UploadButton />
            </div>
          </div>
          <DashboardShell>
            <DataSummary />
            {/* Gráfico ocupando todo o espaço (removida a tabela) */}
            <div className="grid gap-4">
              <DataCharts className="w-full" />
            </div>
          </DashboardShell>
        </div>
      </div>
    </DataProvider>
  )
}
