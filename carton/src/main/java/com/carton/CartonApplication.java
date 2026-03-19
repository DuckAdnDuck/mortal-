package com.carton;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.carton.mapper")
public class CartonApplication {

    public static void main(String[] args) {
        SpringApplication.run(CartonApplication.class, args);
    }

}
