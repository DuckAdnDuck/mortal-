package com.carton.service.impl;

import com.carton.entity.User;
import com.carton.mapper.UserMapper;
import com.carton.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public User login(String username, String password) {

        User user = userMapper.findByUsername(username);

        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("密码错误");
        }

        return user;
    }
    @Override
    public void register(User user) {
        User exist = userMapper.findByUsername(user.getUsername());

        if (exist != null) {
            throw new RuntimeException("用户已存在");
        }

        userMapper.insert(user);
    }
}