// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Reducers
import user from 'src/stores/apps/user'
import auth from 'src/stores/apps/auth'
import cart from 'src/stores/apps/cart'
import review from 'src/stores/apps/review'

export const store = configureStore({
  reducer: {
    user,
    auth,
    cart,
    review
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
