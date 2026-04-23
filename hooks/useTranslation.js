import { useContext } from 'react'
import { ExpensiaContext } from '../context/expensiaContext'
import { es, en } from '../utils/languages'

export function useTranslation() {
    const { user } = useContext(ExpensiaContext)
    return user?.language === 'en' ? en : es
}
