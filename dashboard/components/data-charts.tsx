"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useData } from "@/context/data-context"
import { useEffect, useState, useRef } from "react"

interface DataChartsProps extends React.HTMLAttributes<HTMLDivElement> {}

// Gráfico de linha: volume médio por minuto
function renderVolumeTrendChart(container: HTMLElement, data: any[]) {
  const canvas = document.createElement("canvas")
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
  container.appendChild(canvas)
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Tooltip
  let hoverIndex: number | null = null
  const points: [number, number][] = []

  function redraw() {
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Redesenhar o gráfico
    ctx.fillStyle = "#f4f6fa"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Desenhar grade horizontal
    ctx.strokeStyle = "#e0e6ef"
    ctx.lineWidth = 1
    for (let i = 0; i < 6; i++) {
      const y = 20 + i * ((canvas.height - 60) / 5)
      ctx.beginPath()
      ctx.moveTo(40, y)
      ctx.lineTo(canvas.width - 20, y)
      ctx.stroke()
      
      // Adicionar valores da escala
      ctx.fillStyle = "#666"
      ctx.textAlign = "right"
      const valor = Math.round((Math.max(...volumesParaPlotar, 0) * (5 - i)) / 5)
      ctx.fillText(`${valor} dB`, 35, y + 4)
    }
    
    // Desenhar eixos
    ctx.strokeStyle = "#b0b8c1"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(40, 20)
    ctx.lineTo(40, canvas.height - 40)
    ctx.lineTo(canvas.width - 20, canvas.height - 40)
    ctx.stroke()
    
    // Desenhar linha do gráfico
    ctx.beginPath()
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 3
    
    volumesParaPlotar.forEach((volume, index) => {
      const x = 40 + index * (volumesParaPlotar.length > 1 ? (canvas.width - 60) / (volumesParaPlotar.length - 1) : 0)
      const y = canvas.height - 40 - (Math.max(...volumesParaPlotar, 0) > 0 ? (volume / Math.max(...volumesParaPlotar, 0)) * (canvas.height - 60) : 0)
      points[index] = [x, y]
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Desenhar tooltip se necessário
    if (hoverIndex !== null && points[hoverIndex]) {
      const [x, y] = points[hoverIndex]
      
      // Calcular posição do tooltip
      const tooltipText = `${labelsParaPlotar[hoverIndex]}: ${volumesParaPlotar[hoverIndex].toFixed(1)} dB`
      const textWidth = ctx.measureText(tooltipText).width
      const padding = 10
      const tooltipHeight = 20
      const tooltipY = Math.min(y - 25, canvas.height - tooltipHeight - 10)
      const tooltipX = Math.min(Math.max(x, textWidth/2 + padding), canvas.width - textWidth/2 - padding)
      
      // Desenhar fundo do tooltip
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.fillRect(
        tooltipX - textWidth/2 - padding,
        tooltipY,
        textWidth + padding * 2,
        tooltipHeight
      )
      
      // Desenhar borda do tooltip
      ctx.strokeStyle = "#e0e6ef"
      ctx.lineWidth = 1
      ctx.strokeRect(
        tooltipX - textWidth/2 - padding,
        tooltipY,
        textWidth + padding * 2,
        tooltipHeight
      )
      
      // Desenhar texto do tooltip
      ctx.fillStyle = "#222"
      ctx.textAlign = "center"
      ctx.fillText(tooltipText, tooltipX, tooltipY + 15)
      
      // Destacar o ponto na linha
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = "#3b82f6"
      ctx.fill()
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    let found = null
    for (let i = 0; i < points.length; i++) {
      const [px, py] = points[i]
      if (Math.abs(x - px) < 8 && Math.abs(y - py) < 8) {
        found = i
        break
      }
    }
    if (hoverIndex !== found) {
      hoverIndex = found
      redraw()
    }
  }

  const handleMouseLeave = () => {
    hoverIndex = null
    redraw()
  }

  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('mouseleave', handleMouseLeave)

  // Processar todos os registros individuais
  let volumesParaPlotar = data.map((item) => {
    let vol = item["Volume (dB)"] ?? item.Volume ?? item["volume (dB)"] ?? item.volume
    if (typeof vol === "string") vol = Number(vol.replace(",", "."))
    return typeof vol === "number" && !isNaN(vol) ? vol : null
  }).filter((v) => v !== null) as number[]

  let labelsParaPlotar = data.map((item, index) => {
    if (item.Timestamp) {
      const ts = String(item.Timestamp)
      const match = ts.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/)
      return match ? match[0] : `Reg ${index + 1}`
    }
    return `Reg ${index + 1}`
  })

  if (volumesParaPlotar.length === 0) {
    ctx.fillStyle = "#000"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Sem dados para exibir", canvas.width / 2, canvas.height / 2)
    return
  }

  // Desenhar o gráfico inicial
  redraw()
}

// Gráfico de pizza: minutos com e sem mensagens enviadas
function renderAlertPieChart(container: HTMLElement, data: any[]) {
  const canvas = document.createElement("canvas")
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
  container.appendChild(canvas)
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // Fundo suave
  ctx.fillStyle = "#f4f6fa"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Contar mensagens enviadas e não enviadas
  let enviadas = 0
  let naoEnviadas = 0
  
  console.log("Dados recebidos:", data)
  
  data.forEach((item) => {
    const mensagem = item["Mensagem Telegram"] || item["Mensager"] || "Não"
    console.log("Mensagem encontrada:", mensagem, "Tipo:", typeof mensagem)
    
    // Verificar se a mensagem é "Sim" (case insensitive)
    if (String(mensagem).toLowerCase().trim() === "sim") {
      enviadas++
      console.log("Mensagem enviada encontrada!")
    } else {
      naoEnviadas++
    }
  })

  console.log("Total enviadas:", enviadas, "Total não enviadas:", naoEnviadas)

  const labels = ["Enviada", "Não enviada"]
  const counts = [enviadas, naoEnviadas]
  const colors = ["#ff2e63", "#00C49F"]
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 50
  let startAngle = 0
  const total = counts.reduce((sum, count) => sum + count, 0)
  
  if (total === 0) {
    ctx.fillStyle = "#888"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Nenhum dado para exibir", canvas.width / 2, canvas.height / 2)
    return
  }

  counts.forEach((count, index) => {
    const sliceAngle = (count / total) * 2 * Math.PI
    const endAngle = startAngle + sliceAngle
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = colors[index % colors.length]
    ctx.fill()
    // Adicionar rótulo
    const midAngle = startAngle + sliceAngle / 2
    const labelX = centerX + Math.cos(midAngle) * (radius * 0.7)
    const labelY = centerY + Math.sin(midAngle) * (radius * 0.7)
    ctx.fillStyle = "#000"
    ctx.font = "bold 12px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`${labels[index]}: ${Math.round((count / total) * 100)}%`, labelX, labelY)
    startAngle = endAngle
  })
}

// Gráfico de pizza de status
function renderStatusPieChart(container: HTMLElement, data: any[]) {
  const canvas = document.createElement("canvas")
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
  container.appendChild(canvas)
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // Fundo suave
  ctx.fillStyle = "#f4f6fa"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // Contar status
  const statusCounts: Record<string, number> = {}
  data.forEach((item) => {
    const status = item.Status || "Desconhecido"
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })
  const statuses = Object.keys(statusCounts)
  const counts = Object.values(statusCounts)
  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 50
  let startAngle = 0
  const total = counts.reduce((sum, count) => sum + count, 0)
  counts.forEach((count, index) => {
    const sliceAngle = (count / total) * 2 * Math.PI
    const endAngle = startAngle + sliceAngle
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = colors[index % colors.length]
    ctx.fill()
    // Adicionar rótulo
    const midAngle = startAngle + sliceAngle / 2
    const labelX = centerX + Math.cos(midAngle) * (radius * 0.7)
    const labelY = centerY + Math.sin(midAngle) * (radius * 0.7)
    ctx.fillStyle = "#000"
    ctx.font = "bold 12px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`${statuses[index]}: ${Math.round((count / total) * 100)}%`, labelX, labelY)
    startAngle = endAngle
  })
}

function ChartContainer({ chartType, data }: { chartType: string, data: any[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !ref.current) return

    // Limpar o container antes de renderizar
    while (ref.current.firstChild) {
      ref.current.removeChild(ref.current.firstChild)
    }

    switch (chartType) {
      case "volume":
        renderVolumeTrendChart(ref.current, data)
        break
      case "alerts":
        renderAlertPieChart(ref.current, data)
        break
      case "status":
        renderStatusPieChart(ref.current, data)
        break
    }

    // Cleanup function
    return () => {
      if (ref.current) {
        while (ref.current.firstChild) {
          ref.current.removeChild(ref.current.firstChild)
        }
      }
    }
  }, [chartType, data, isClient])

  return <div ref={ref} className="w-full h-[400px]" />
}

export function DataCharts({ className, ...props }: DataChartsProps) {
  const { data } = useData()
  const [chartType, setChartType] = useState<"volume" | "alerts" | "status">("volume")
  const chartTitles = {
    volume: "Volume médio por minuto",
    alerts: "Mensagens enviadas",
    status: "Distribuição de Status"
  }

  return (
    <Card className={cn("h-[600px]", className)} {...props}>
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight text-center w-full pb-0 pt-2">{chartTitles[chartType]}</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <Tabs defaultValue="volume" onValueChange={(value) => setChartType(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="volume">Volume/Minuto</TabsTrigger>
            <TabsTrigger value="alerts">Mensagens enviadas</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>
          <ChartContainer chartType={chartType} data={data} />
        </Tabs>
      </CardContent>
    </Card>
  )
}
