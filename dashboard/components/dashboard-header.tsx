import { FileSpreadsheet } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-center py-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Projeto Fala Baixo</h1>
        </div>
      </div>
    </header>
  )
}
