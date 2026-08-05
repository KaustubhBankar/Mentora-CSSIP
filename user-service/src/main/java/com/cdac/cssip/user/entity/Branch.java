package com.cdac.cssip.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "branches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String branchCode;
    @Column(nullable = false)
    private String branchName;
    private Integer batchYear;
    private String center;

    @Column
    @Builder.Default
    private Boolean active = true;
}