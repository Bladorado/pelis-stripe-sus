-- Deshabilitar RLS temporalmente (SOLO PARA PRUEBAS)
ALTER TABLE perfiles DISABLE ROW LEVEL SECURITY;

-- Luego prueba tu dashboard

-- Volver a habilitar RLS cuando funcione
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;