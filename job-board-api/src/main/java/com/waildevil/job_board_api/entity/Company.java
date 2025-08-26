package com.waildevil.job_board_api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String industry;

    private String website;

    private String description;

    private String location;

    private String city;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL)
    private List<User> employees;
}
