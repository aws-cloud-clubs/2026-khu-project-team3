package com.sajuhomerun.backend_api.team;


import com.sajuhomerun.backend_api.player.Player;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Entity
@Getter
@Table(name = "teams")
@NoArgsConstructor
public class Team {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = true)
    private Integer ranking;

    @Column(name = "ranking_base_date")
    private LocalDate rankingBaseDate;

    @OneToMany(mappedBy = "team")
    private List<Player> players = new ArrayList<>();
}
