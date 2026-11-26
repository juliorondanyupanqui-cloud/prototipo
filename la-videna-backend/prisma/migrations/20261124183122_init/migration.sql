-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(120) NOT NULL,
    "dni_documento" VARCHAR(15),
    "telefono" VARCHAR(20) NOT NULL,
    "rol" VARCHAR(20) NOT NULL DEFAULT 'CLIENTE',
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "canchas" (
    "id_cancha" SERIAL NOT NULL,
    "codigo_interno" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "precio_hora_dia" DECIMAL(8,2) NOT NULL,
    "precio_hora_noche" DECIMAL(8,2) NOT NULL,
    "imagen_url" VARCHAR(255) NOT NULL,
    "estado_operativo" VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',

    CONSTRAINT "canchas_pkey" PRIMARY KEY ("id_cancha")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id_reserva" SERIAL NOT NULL,
    "codigo_ticket" VARCHAR(25) NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_cancha" INTEGER NOT NULL,
    "fecha_programada" VARCHAR(10) NOT NULL,
    "hora_inicio" VARCHAR(5) NOT NULL,
    "hora_fin" VARCHAR(5) NOT NULL,
    "duracion_horas" DECIMAL(4,1) NOT NULL,
    "inicio_timestamp" BIGINT NOT NULL,
    "fin_timestamp" BIGINT NOT NULL,
    "precio_total" DECIMAL(8,2) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADA',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id_reserva")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_dni_documento_key" ON "usuarios"("dni_documento");

-- CreateIndex
CREATE UNIQUE INDEX "canchas_codigo_interno_key" ON "canchas"("codigo_interno");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_codigo_ticket_key" ON "reservas"("codigo_ticket");

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_id_cancha_fkey" FOREIGN KEY ("id_cancha") REFERENCES "canchas"("id_cancha") ON DELETE RESTRICT ON UPDATE CASCADE;
