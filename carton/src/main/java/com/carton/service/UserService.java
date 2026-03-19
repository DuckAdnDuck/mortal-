package com.carton.service;

import com.carton.entity.User;

public interface UserService {
    User login(String username, String password);
    void register(User user);
}