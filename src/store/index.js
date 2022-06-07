import create from 'zustand'
import produce from 'immer'

const immer = (config) => (set, get) => config((fn) => set(produce(fn)), get)

const store = (set, get) => ({
  dropdownOpen: false,
  set,

  approveCookies: () => {
    set((state) => {
      state.userAgreedCookie = true
    })
  },
})

const useStore = create(immer(store))

export { useStore }
