"use client"

import type React from "react"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { read, utils } from "xlsx"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/context/data-context"

export function UploadButton() {
  const { toast } = useToast()
  const { setData } = useData()
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)

      // Ler o arquivo XLSX
      const data = await file.arrayBuffer()
      const workbook = read(data)

      // Obter a primeira planilha
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]

      // Converter para JSON
      const jsonData = utils.sheet_to_json(worksheet)

      // Processar os dados para garantir que os valores numéricos sejam tratados corretamente
      // e manter apenas as colunas essenciais
      const processedData = jsonData.map((row: any) => {
        // Extrair e converter o Volume para número, aceitando vários nomes de coluna
        let volume = 0
        let volumeRaw = row.Volume ?? row["Volume (dB)"] ?? row.volume ?? row["volume (dB)"]
        if (volumeRaw !== undefined) {
          if (typeof volumeRaw === "string") {
            volume = Number.parseFloat(volumeRaw.replace(",", "."))
          } else if (typeof volumeRaw === "number") {
            volume = volumeRaw
          }
        }
        // Garantir timestamp como string
        const timestamp = row.Timestamp ? String(row.Timestamp) : ""
        // Status calculado
        const status = volume > 60 ? "Alto" : "Normal"
        // Manter a mensagem do Telegram
        const mensagem = row["Mensagem Telegram"] ?? row["Mensager"] ?? "Não"
        
        return {
          Timestamp: timestamp,
          Volume: isNaN(volume) ? 0 : volume,
          Status: status,
          "Mensagem Telegram": mensagem
        }
      })

      // Atualizar o contexto com os novos dados
      setData(processedData)

      toast({
        title: "Arquivo carregado com sucesso",
        description: `${processedData.length} registros encontrados.`,
      })
    } catch (error) {
      console.error("Erro ao processar arquivo:", error)
      toast({
        title: "Erro ao processar arquivo",
        description: "Verifique se o formato do arquivo é válido.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        id="xlsx-upload"
        accept=".xlsx,.xls"
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        onChange={handleFileUpload}
        disabled={isLoading}
      />
      <Button disabled={isLoading}>
        <Upload className="mr-2 h-4 w-4" />
        {isLoading ? "Carregando..." : "Carregar XLSX"}
      </Button>
    </div>
  )
}
