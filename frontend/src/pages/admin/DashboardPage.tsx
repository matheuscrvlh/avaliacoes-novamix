// REACT
import { useEffect, useState } from "react"

// LIB
import { getAvaliacoes } from "@/lib/api"

export default function DashboardPage() {
    const [ avaliacoes, setAvaliacoes ] = useState([]);

    useEffect(() => {
        async function fetchAvaliacoes() {
            const res =  await getAvaliacoes()
            setAvaliacoes(res)
        }
        fetchAvaliacoes()
    }, [])

    return (
        <div>
            {avaliacoes.map((avaliacao, i) => (
                <div key={i} className='flex'>
                    <p>{avaliacao.id}</p>
                    <p>{avaliacao.idfilial}</p>
                    <p>{avaliacao.nomefilial}</p>
                    <p>{avaliacao.nota}</p>
                    <p>{avaliacao.comentario}</p>
                    <p>{avaliacao.data}</p>
                </div>
            ))}
        </div>
    )
}