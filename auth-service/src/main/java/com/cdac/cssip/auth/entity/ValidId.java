package com.cdac.cssip.auth.entity;

import com.cdac.cssip.common.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "valid_ids")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidId {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @Column(unique = true, nullable = false)
    String cdacId;
    @Enumerated(EnumType.STRING)
    Role role;
    boolean used;
}