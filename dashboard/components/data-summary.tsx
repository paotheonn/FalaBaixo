"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, Activity, AlertCircle, Clock } from "lucide-react"
import { useData } from "@/context/data-context"
import { useMemo } from "react"

interface DataSummaryProps {
  className?: string
}

export function DataSummary({ className }: DataSummaryProps) {
  const { data } = useData()

  // Calcular estatísticas usando useMemo para evitar recálculos desnecessários
  const stats = useMemo(() => {
    // Valor padrão
    const defaultStats = {
      totalRegistros: 0,
      volumeMedio: 0,
      statusAlto: 0,
      ultimaAtualizacao: "-",
    }

    if (!data || data.length === 0) {
      return defaultStats
    }

    // Calcular volume total e médio
    let volumeTotal = 0
    let validVolumes = 0

    data.forEach((item) => {
      if (item.Volume !== undefined && item.Volume !== null) {
        const volume = Number(item.Volume)
        if (!isNaN(volume)) {
          volumeTotal += volume
          validVolumes++
        }
      }
    })

    const volumeMedio = validVolumes > 0 ? Number((volumeTotal / validVolumes).toFixed(2)) : 0

    // Contar status alto (Status === 'Alto')
    const statusAlto = data.filter((item) => item.Status === 'Alto').length

    let ultimaHoraPlanilha = "-"
    if (data && data.length > 0) {
      const timestamps = data.map((item) => String(item.Timestamp)).filter(Boolean)
      if (timestamps.length > 0) {
        const ultima = timestamps.sort().slice(-1)[0]
        // Pega só a hora (HH:MM:SS)
        const match = ultima.match(/\d{2}:\d{2}:\d{2}/)
        ultimaHoraPlanilha = match ? match[0] : ultima
      }
    }

    return {
      totalRegistros: data.length,
      volumeMedio: volumeMedio,
      statusAlto: statusAlto,
      ultimaAtualizacao: ultimaHoraPlanilha,
    }
  }, [data])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRegistros}</div>
          <p className="text-xs text-muted-foreground">Registros na planilha</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Volume Médio</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.volumeMedio}</div>
          <p className="text-xs text-muted-foreground">Média de todos os volumes</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status Alto</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.statusAlto}</div>
          <p className="text-xs text-muted-foreground">Registros com volume alto (&gt; 60 dB)</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.ultimaAtualizacao}</div>
          <p className="text-xs text-muted-foreground">Última hora registrada na planilha</p>
        </CardContent>
      </Card>
    </div>
  )
}
