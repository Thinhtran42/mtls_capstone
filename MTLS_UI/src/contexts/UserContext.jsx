import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

export const UserContext = createContext();

const initialUsers = [
  {
    id: 1,
    name: "Trần Khánh Thịnh",
    email: "thinhtk.se160233@gmail.com",
    role: "Học sinh",
    gender: "Nam",
    avatar: "https://i.pravatar.cc/150?img=1",
    status: "active",
  },
  {
    id: 2,
    name: "Huỳnh Nhất Thiên Hoàng",
    email: "hoanghnts.e160248@fpt.edu.vn",
    role: "Giáo viên",
    gender: "Nam",
    avatar: "https://i.pravatar.cc/150?img=2",
    status: "active",
  },
  {
    id: 3,
    name: "Nguyễn Thị Đẹp",
    email: "deontss160000@gmail.com",
    role: "Học sinh",
    gender: "Nữ",
    avatar: "https://i.pravatar.cc/150?img=3",
    status: "active",
  },
  {
    id: 4,
    name: "Lưu Thành Đạt",
    email: "nhatlvse162016@gmail.com",
    role: "Quản trị viên",
    gender: "Nam",
    avatar: "https://i.pravatar.cc/150?img=4",
    status: "active",
  },
  {
    id: 5,
    name: "Lê Văn Nhật",
    email: "nhatlvse162016@fpt.edu.vn",
    role: "Quản trị viên",
    gender: "Nam",
    avatar: "https://i.pravatar.cc/150?img=5",
    status: "active",
  },
  {
    id: 6,
    name: "Lý Bé Đường",
    email: "duonglbss160999@fpt.edu.vn",
    role: "Giáo viên",
    gender: "Nữ",
    avatar: "https://i.pravatar.cc/150?img=6",
    status: "active",
  },
];

export function UserProvider({ children }) {
  const [users, setUsers] = useState(initialUsers);
  const [blockedUsers, setBlockedUsers] = useState([]);

  const blockUser = (userId) => {
    const userToBlock = users.find(u => u.id === userId);
    if (userToBlock) {
      setUsers(users.filter(u => u.id !== userId));
      setBlockedUsers([...blockedUsers, { ...userToBlock, status: 'blocked' }]);
    }
  };

  const unblockUser = (userId) => {
    const userToUnblock = blockedUsers.find(u => u.id === userId);
    if (userToUnblock) {
      setBlockedUsers(blockedUsers.filter(u => u.id !== userId));
      setUsers([...users, { ...userToUnblock, status: 'active' }]);
    }
  };

  const updateUser = (userId, updatedData) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, ...updatedData }
          : user
      )
    );
  };

  const addUser = (newUser) => {
    const lastId = Math.max(...users.map(user => user.id));
    const userWithId = {
      ...newUser,
      id: lastId + 1,
      status: 'active'
    };
    setUsers(prevUsers => [...prevUsers, userWithId]);
  };

  return (
    <UserContext.Provider value={{ 
      users, 
      blockedUsers,
      blockUser,
      unblockUser,
      updateUser,
      addUser
    }}>
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUsers = () => useContext(UserContext); 