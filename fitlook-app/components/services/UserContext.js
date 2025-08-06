import React, { createContext, useState } from 'react';

// 1. Context oluştur
export const UserContext = createContext();

// 2. Provider component oluştur
export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);

    return (
        <UserContext.Provider value={{ userId, setUserId }}>
            {children}
        </UserContext.Provider>
    );
};
