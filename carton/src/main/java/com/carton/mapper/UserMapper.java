package com.carton.mapper;

import com.carton.entity.User;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper {
//登入
    @Select("SELECT * FROM user WHERE username = #{username}")
    User findByUsername(String username);

//    注册
    @Insert("INSERT INTO user(username, password) VALUES(#{username}, #{password})")
    void insert(User user);
}