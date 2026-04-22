import { useEffect, useState, useMemo } from "react"
import { getAvaliacoes } from "../../../../lib/api"
import { Avaliacao } from "../types/avaliacao"
import { PER_PAGE } from "../constants"

export function useDashboard() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [filterLoja, setFilterLoja] = useState("all")
  const [filterNota, setFilterNota] = useState("all")
  const [page, setPage]             = useState(1)

  useEffect(() => {
    async function fetchAvaliacoes() {
      try {
        setLoading(true)
        setError(null)
        const res = await getAvaliacoes()
        setAvaliacoes(res)
      } catch {
        setError("Não foi possível carregar as avaliações.")
      } finally {
        setLoading(false)
      }
    }
    fetchAvaliacoes()
  }, [])

  const lojas = useMemo(() => {
    const map = new Map<number, string>()
    avaliacoes.forEach((a) => map.set(a.idfilial, a.nomefilial))
    return [...map.entries()].sort((a, b) => a[0] - b[0])
  }, [avaliacoes])

  const metrics = useMemo(() => {
    const total = avaliacoes.length
    const media = total
      ? (avaliacoes.reduce((s, a) => s + Number(a.nota), 0) / total).toFixed(1)
      : "—"
    const pct5 = total
      ? Math.round((avaliacoes.filter((a) => Number(a.nota) === 5).length / total) * 100)
      : 0
    const withComment = avaliacoes.filter((a) => a.comentario?.trim()).length
    return { total, media, pct5, withComment }
  }, [avaliacoes])

  const distribuicao = useMemo(() =>
    [5, 4, 3, 2, 1].map((nota) => ({
      nota,
      count: avaliacoes.filter((a) => Number(a.nota) === nota).length,
    })),
  [avaliacoes])

  const filteredData = useMemo(() =>
    avaliacoes.filter((a) => {
      const okLoja = filterLoja === "all" || String(a.idfilial) === filterLoja
      const okNota = filterNota === "all" || String(a.nota) === filterNota
      return okLoja && okNota
    }),
  [avaliacoes, filterLoja, filterNota])

  const totalPages = Math.ceil(filteredData.length / PER_PAGE)
  const pageData   = filteredData.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleFilterLoja(val: string) { setFilterLoja(val); setPage(1) }
  function handleFilterNota(val: string) { setFilterNota(val); setPage(1) }
  function handlePageChange(p: number)   { setPage(Math.min(Math.max(1, p), totalPages)) }

  return {
    avaliacoes,
    loading,
    error,
    lojas,
    metrics,
    distribuicao,
    filteredData,
    pageData,
    filterLoja,
    filterNota,
    page,
    totalPages,
    handleFilterLoja,
    handleFilterNota,
    handlePageChange,
  }
}
