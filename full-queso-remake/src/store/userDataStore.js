import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { secureStorage } from '../utils/secureStorage'
import { SecurityManager } from '../utils/securityHeaders'

const useUserDataStore = create(
    persist(
        (set, get) => ({
            userData: {
                fullName: '',
                phone: '',
                email: '',
                address: '',
                notes: '',
                deliveryAddress: '',
                deliveryCoords: null,
                savedAddresses: [],
                homeAddress: '',
                workAddress: ''
            },

            updateUserData: (data) => {
                // Sanitize input data
                const sanitizedData = SecurityManager.sanitizeFormData(data);
                
                set((state) => ({
                    userData: { ...state.userData, ...sanitizedData }
                }));
                
                // Store sensitive data securely
                const sensitiveFields = ['phone', 'email', 'address', 'deliveryAddress'];
                sensitiveFields.forEach(field => {
                    if (sanitizedData[field]) {
                        secureStorage.setSecure(`user_${field}`, sanitizedData[field]);
                    }
                });
            },

            clearUserData: () => {
                set({
                    userData: {
                        fullName: '',
                        phone: '',
                        email: '',
                        address: '',
                        notes: '',
                        deliveryAddress: '',
                        deliveryCoords: null,
                        savedAddresses: [],
                        homeAddress: '',
                        workAddress: ''
                    }
                });
                
                // Clear secure storage
                secureStorage.clearAllSecure();
            },

            addSavedAddress: (addressData) => {
                const sanitizedAddress = SecurityManager.sanitizeFormData(addressData);
                const newAddress = {
                    id: SecurityManager.generateSecureId(),
                    ...sanitizedAddress,
                    createdAt: new Date().toISOString()
                };
                
                set((state) => ({
                    userData: {
                        ...state.userData,
                        savedAddresses: [...state.userData.savedAddresses, newAddress]
                    }
                }));
                
                // Store address securely
                secureStorage.setSecure(`address_${newAddress.id}`, newAddress);
            },

            removeSavedAddress: (addressId) => {
                set((state) => ({
                    userData: {
                        ...state.userData,
                        savedAddresses: state.userData.savedAddresses.filter(addr => addr.id !== addressId)
                    }
                }));
                
                // Remove from secure storage
                secureStorage.removeSecure(`address_${addressId}`);
            },

            selectSavedAddress: (addressId) => set((state) => {
                try {
                    const savedAddresses = state.userData?.savedAddresses || []
                    const selectedAddress = savedAddresses.find(addr => addr.id === addressId)
                    if (selectedAddress) {
                        return {
                            userData: {
                                ...state.userData,
                                deliveryAddress: selectedAddress.address,
                                deliveryCoords: selectedAddress.coords
                            }
                        }
                    }
                    return state
                } catch (error) {
                    console.error('Error selecting address:', error)
                    return state
                }
            }),

            isDataComplete: () => {
                const { fullName, phone } = get().userData;
                return fullName.trim() !== '' && phone.trim() !== '';
            }
        }),
        {
            name: 'full-queso-user-data',
            partialize: (state) => ({ userData: state.userData })
        }
    )
)

export default useUserDataStore