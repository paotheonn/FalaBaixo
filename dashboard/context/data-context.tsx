"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

// Simplificar o tipo para os dados essenciais
interface DataItem {
  Timestamp?: string
  Volume: number
  Status?: string
  "Mensagem Telegram"?: string
}

interface DataContextType {
  data: DataItem[]
  setData: (data: DataItem[]) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Dados simplificados apenas com as colunas essenciais
const sampleData = [
  { Timestamp: "2025-05-10", Volume: 26.8, Status: "Normal" },
  { Timestamp: "2025-05-10", Volume: 30.8, Status: "Normal" },
  { Timestamp: "2025-05-10", Volume: 27.7, Status: "Normal" },
  { Timestamp: "2025-05-10", Volume: 35.0, Status: "Normal" },
  { Timestamp: "2025-05-10", Volume: 30.0, Status: "Normal" },
  { Timestamp: "2025-05-10", Volume: 38.2, Status: "Normal" },
  { Timestamp: "2025-05-10", Volume: 42.6, Status: "Normal" },
  { Timestamp: "2025-05-10", Volume: 44.8, Status: "Normal" },
  { Timestamp: "2025-05-10", Volume: 36.7, Status: "Normal" },
]

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DataItem[]>([])
  return <DataContext.Provider value={{ data, setData }}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
