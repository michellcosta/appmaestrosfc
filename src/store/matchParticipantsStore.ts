import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, DiaristRequestStatus } from '@/types'
import { useNotificationsStore } from './notificationsStore'

export interface MatchParticipant {
  id: string
  matchId: string
  userId: string
  userRole: 'mensalista' | 'diarista'
  status: 'confirmed' | 'waiting_list' | 'requested'
  confirmedAt?: Date
  requestedAt?: Date
  user?: User
}

export interface DiaristRequest {
  id: string
  matchId: string
  userId: string
  status: DiaristRequestStatus
  requestedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  notes?: string
  user?: User
}

interface MatchParticipantsStore {
  participants: MatchParticipant[]
  diaristRequests: DiaristRequest[]
  loading: boolean
  error: string | null

  // Ações para mensalistas
  confirmParticipation: (matchId: string, user: User) => Promise<void>
  cancelParticipation: (matchId: string, userId: string) => Promise<void>

  // Ações para diaristas
  requestToPlay: (matchId: string, user: User) => Promise<void>
  cancelRequest: (matchId: string, userId: string) => Promise<void>

  // Ações para administradores
  approveRequest: (requestId: string, reviewerId: string) => Promise<void>
  rejectRequest: (requestId: string, reviewerId: string, notes?: string) => Promise<void>

  // Consultas
  getParticipantsByMatch: (matchId: string) => MatchParticipant[]
  getConfirmedParticipants: (matchId: string) => MatchParticipant[]
  getWaitingListParticipants: (matchId: string) => MatchParticipant[]
  getPendingRequests: (matchId: string) => DiaristRequest[]
  getAllPendingRequests: () => DiaristRequest[]
  getUserParticipation: (matchId: string, userId: string) => MatchParticipant | null
  getUserRequest: (matchId: string, userId: string) => DiaristRequest | null
  hasUserConfirmed: (matchId: string, userId: string) => boolean
  hasUserRequested: (matchId: string, userId: string) => boolean
  canUserConfirm: (matchId: string, user: User, maxPlayers: number) => boolean

  // Utilitários
  reset: () => void
  loadExampleData: () => void
}

export const useMatchParticipantsStore = create<MatchParticipantsStore>()(
  persist(
    (set, get) => ({
      participants: [],
      diaristRequests: [],
      loading: false,
      error: null,

      // Confirmar participação (mensalistas)
      confirmParticipation: async (matchId: string, user: User) => {
        set({ loading: true, error: null })
        
        try {
          const newParticipant: MatchParticipant = {
            id: `${matchId}-${user.id}-${Date.now()}`,
            matchId,
            userId: user.id,
            userRole: user.role as 'mensalista' | 'diarista',
            status: 'confirmed',
            confirmedAt: new Date(),
            user
          }

          set((state) => ({
            participants: [...state.participants.filter(p => !(p.matchId === matchId && p.userId === user.id)), newParticipant],
            loading: false
          }))

          // TODO: Sincronizar com servidor
          console.log('Participação confirmada:', newParticipant)
        } catch (error) {
          set({ error: 'Erro ao confirmar participação', loading: false })
        }
      },

      // Cancelar participação
      cancelParticipation: async (matchId: string, userId: string) => {
        set({ loading: true, error: null })
        
        try {
          set((state) => ({
            participants: state.participants.filter(p => !(p.matchId === matchId && p.userId === userId)),
            loading: false
          }))

          // TODO: Sincronizar com servidor
          console.log('Participação cancelada')
        } catch (error) {
          set({ error: 'Erro ao cancelar participação', loading: false })
        }
      },

      // Solicitar para jogar (diaristas)
      requestToPlay: async (matchId: string, user: User) => {
        set({ loading: true, error: null })
        
        try {
          const existingRequest = get().diaristRequests.find(
            req => req.matchId === matchId && req.userId === user.id
          );

          if (existingRequest) {
            throw new Error('Solicitação já existe para esta partida');
          }

          const newRequest: DiaristRequest = {
            id: `req-${matchId}-${user.id}-${Date.now()}`,
            matchId,
            userId: user.id,
            status: 'pending',
            requestedAt: new Date(),
            user
          }

          set((state) => ({
            diaristRequests: [...state.diaristRequests.filter(r => !(r.matchId === matchId && r.userId === user.id)), newRequest],
            loading: false
          }))

          // Criar notificação para admins
          const notificationsStore = useNotificationsStore.getState();
          const matchDate = new Date().toLocaleDateString('pt-BR'); // Idealmente pegar a data real da partida
          notificationsStore.createDiaristRequestNotification(matchId, user, matchDate);
          
          console.log('Solicitação criada:', newRequest)
        } catch (error) {
          set({ error: 'Erro ao solicitar participação', loading: false })
        }
      },

      // Cancelar solicitação
      cancelRequest: async (matchId: string, userId: string) => {
        set({ loading: true, error: null })
        
        try {
          set((state) => ({
            diaristRequests: state.diaristRequests.filter(r => !(r.matchId === matchId && r.userId === userId)),
            loading: false
          }))

          console.log('Solicitação cancelada')
        } catch (error) {
          set({ error: 'Erro ao cancelar solicitação', loading: false })
        }
      },

      // Aprovar solicitação
      approveRequest: async (requestId: string, reviewerId: string) => {
        set({ loading: true, error: null })
        
        try {
          const request = get().diaristRequests.find(r => r.id === requestId)
          if (!request) throw new Error('Solicitação não encontrada')

          // Atualizar status da solicitação
          set((state) => ({
            diaristRequests: state.diaristRequests.map(r => 
              r.id === requestId 
                ? { ...r, status: 'approved', reviewedAt: new Date(), reviewedBy: reviewerId }
                : r
            ),
            loading: false
          }))

          // Adicionar à lista de espera
          const newParticipant: MatchParticipant = {
            id: `${request.matchId}-${request.userId}-${Date.now()}`,
            matchId: request.matchId,
            userId: request.userId,
            userRole: 'diarista',
            status: 'waiting_list',
            confirmedAt: new Date(),
            user: request.user
          }

          set((state) => ({
            participants: [...state.participants, newParticipant]
          }))

          console.log('Solicitação aprovada e adicionada à lista de espera')
        } catch (error) {
          set({ error: 'Erro ao aprovar solicitação', loading: false })
        }
      },

      // Rejeitar solicitação
      rejectRequest: async (requestId: string, reviewerId: string, notes?: string) => {
        set({ loading: true, error: null })
        
        try {
          set((state) => ({
            diaristRequests: state.diaristRequests.map(r => 
              r.id === requestId 
                ? { ...r, status: 'rejected', reviewedAt: new Date(), reviewedBy: reviewerId, notes }
                : r
            ),
            loading: false
          }))

          console.log('Solicitação rejeitada')
        } catch (error) {
          set({ error: 'Erro ao rejeitar solicitação', loading: false })
        }
      },

      // Consultas
      getParticipantsByMatch: (matchId: string) => {
        return get().participants.filter(p => p.matchId === matchId)
      },

      getConfirmedParticipants: (matchId: string) => {
        return get().participants.filter(p => p.matchId === matchId && p.status === 'confirmed')
      },

      getWaitingListParticipants: (matchId: string) => {
        return get().participants.filter(p => p.matchId === matchId && p.status === 'waiting_list')
      },

      getPendingRequests: (matchId: string) => {
        return get().diaristRequests.filter(r => r.matchId === matchId && r.status === 'pending')
      },

      getAllPendingRequests: () => {
        return get().diaristRequests.filter(r => r.status === 'pending')
      },

      getUserParticipation: (matchId: string, userId: string) => {
        return get().participants.find(p => p.matchId === matchId && p.userId === userId) || null
      },

      getUserRequest: (matchId: string, userId: string) => {
        return get().diaristRequests.find(r => r.matchId === matchId && r.userId === userId) || null
      },

      hasUserConfirmed: (matchId: string, userId: string) => {
        return get().participants.some(p => p.matchId === matchId && p.userId === userId && p.status === 'confirmed')
      },

      hasUserRequested: (matchId: string, userId: string) => {
        return get().diaristRequests.some(r => r.matchId === matchId && r.userId === userId && r.status === 'pending')
      },

      canUserConfirm: (matchId: string, user: User, maxPlayers: number) => {
        const confirmedCount = get().getConfirmedParticipants(matchId).length
        
        // Mensalistas sempre podem confirmar (nunca aparece "partida cheia")
        if (user.role === 'mensalista') {
          return true
        }
        
        // Diaristas só podem se não estiver cheia
        if (user.role === 'diarista') {
          return confirmedCount < maxPlayers
        }
        
        return false
      },

      // Utilitários
      reset: () => {
        set({ participants: [], diaristRequests: [], loading: false, error: null })
      },

      loadExampleData: () => {
        // Função removida - sistema baseado apenas em dados reais
        // Os dados mockados foram removidos para usar apenas jogadores reais cadastrados
        console.log('loadExampleData foi chamada, mas dados mock foram removidos');
      }
    }),
    {
      name: 'match-participants-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        participants: state.participants,
        diaristRequests: state.diaristRequests
      })
    }
  )
)