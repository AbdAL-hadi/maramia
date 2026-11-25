import { Route, Routes } from 'react-router-dom'
import '../styles/reservation.css'
import { ReservationProvider } from '../context/ReservationContext'
import { ReservationPage } from './ReservationPage'
import { ReservationConfirmation, ReservationManager } from './ReservationRecordsPage'
import { NotFoundPage } from './NotFoundPage'

export default function ReservationRoutes() {
  return (
    <ReservationProvider>
      <Routes>
        <Route index element={<ReservationPage />} />
        <Route path="manage" element={<ReservationManager />} />
        <Route path=":reference" element={<ReservationConfirmation />} />
        <Route path=":reference/edit" element={<ReservationPage editing />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ReservationProvider>
  )
}
