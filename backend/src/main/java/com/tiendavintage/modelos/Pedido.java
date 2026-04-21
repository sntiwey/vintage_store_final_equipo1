package com.tiendavintage.modelos;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    private EstadoPedido estado = EstadoPedido.PENDIENTE;

    @Column(columnDefinition = "TEXT")
    private String direccion;

    @Column(length = 100)
    private String colonia;

    @Column(length = 100)
    private String ciudad;

    @Column(name = "estado_republica", length = 100)
    private String estadoRepublica;

    @Column(name = "codigo_postal", length = 10)
    private String codigoPostal;

    @Column(columnDefinition = "TEXT")
    private String referencias;

    @Column(length = 20)
    private String lat;

    @Column(length = 20)
    private String lng;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    @Builder.Default
    private List<PedidoItem> items = new ArrayList<>();

    @PrePersist
    protected void alCrear() {
        creadoEn = LocalDateTime.now();
    }

    public enum EstadoPedido {
        PENDIENTE, PAGADO, ENVIADO, ENTREGADO, CANCELADO
    }
}
