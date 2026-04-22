import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth, authHeader } from '../hooks/useAuth';
import {
  AppBar, Toolbar, Typography, Button, Box, Container,
  Grid, Card, CardContent, TextField, MenuItem, Select,
  InputLabel, FormControl, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Alert, Chip, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import logo from '../assets/logo.png';

//Constantes

const API = 'http://localhost:3001/api';

const COLOR_PALETTE = [
  '#f44336', '#2196f3', '#ff9800', '#4caf50',
  '#9c27b0', '#00bcd4', '#f492ff', '#fff537',
];

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
               'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const ANIOS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];

// Tipos 

interface Movimiento {
  id: number;
  monto: number;
  descripcion: string;
  fecha: string;
  categoria_id?: number;
  categoria_nombre?: string;
}

interface Resumen {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
}

interface Categoria {
  id: number;
  nombre: string;
}


/** Formatea un número como moneda dominicana */
const fmt = (n: number) =>
  `$${n.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;

/** Retorna la fecha de hoy en formato YYYY-MM-DD */
const hoy = () => new Date().toISOString().split('T')[0];

/** Suma los montos de una lista de movimientos agrupados por mes (índice 0–11) */
const agruparPorMes = (movimientos: Movimiento[], anio: number): number[] => {
  const meses = Array(12).fill(0);
  movimientos.forEach(m => {
    const fecha = new Date(m.fecha);
    if (fecha.getFullYear() === anio) {
      meses[fecha.getMonth()] += parseFloat(m.monto as any) || 0;
    }
  });
  return meses;
};

// Componente Principal

const Dashboard: React.FC = () => {
  const { username, logout } = useAuth();

  // Tab activo (0=Ingresos, 1=Gastos, 2=Movimientos, 3=Gráficas)
  const [tab, setTab] = useState(0);

  // Datos del servidor
  const [ingresos, setIngresos]     = useState<Movimiento[]>([]);
  const [gastos, setGastos]         = useState<Movimiento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [resumen, setResumen]       = useState<Resumen>({ totalIngresos: 0, totalGastos: 0, balance: 0 });

  // Mensaje de éxito temporal
  const [success, setSuccess] = useState('');

  // Campos del formulario de ingreso
  const [montoI, setMontoI] = useState('');
  const [descI, setDescI]   = useState('');
  const [fechaI, setFechaI] = useState(hoy());

  // Campos del formulario de gasto
  const [montoG, setMontoG] = useState('');
  const [descG, setDescG]   = useState('');
  const [fechaG, setFechaG] = useState(hoy());
  const [catG, setCatG]     = useState('');

  // Filtros para la pestaña Movimientos
  const [filtroDesde, setFiltroDesde]         = useState('');
  const [filtroHasta, setFiltroHasta]         = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  // Efectos visuales al agregar un movimiento
  const [ingresoBrilla, setIngresoBrilla] = useState(false);
  const [gastoBrilla, setGastoBrilla]     = useState(false);

  // Año seleccionado para las gráficas de barras
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

  // Datos derivados para la gráfica de torta 

  const gastosPorCategoria = gastos.reduce((acc: Record<string, number>, g) => {
    const cat = g.categoria_nombre || 'Sin categoría';
    acc[cat] = (acc[cat] || 0) + Number(g.monto);
    return acc;
  }, {});

  const etiquetas   = Object.keys(gastosPorCategoria);
  const valores     = Object.values(gastosPorCategoria);
  const totalGastos = valores.reduce((a, b) => a + b, 0);

  // Datos derivados para las gráficas de barras 

  const gastosPorMes   = React.useMemo(() => agruparPorMes(gastos, anioSeleccionado),   [gastos, anioSeleccionado]);
  const ingresosPorMes = React.useMemo(() => agruparPorMes(ingresos, anioSeleccionado), [ingresos, anioSeleccionado]);

  const maxGastos   = Math.max(...gastosPorMes, 1);
  const maxIngresos = Math.max(...ingresosPorMes, 1);

  //  Fetch de datos 

  const fetchData = useCallback(async () => {
    const [ingRes, gasRes, resRes, catRes] = await Promise.all([
      axios.get(`${API}/ingresos`,   authHeader()),
      axios.get(`${API}/gastos`,     authHeader()),
      axios.get(`${API}/resumen`,    authHeader()),
      axios.get(`${API}/categorias`, authHeader()),
    ]);
    setIngresos(ingRes.data);
    setGastos(gasRes.data);
    setResumen(resRes.data);
    setCategorias(catRes.data);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  //  Acciones 

  /** Muestra un mensaje verde por 3 segundos */
  const mostrarExito = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  /** Activa el brillo de una tarjeta por 400ms */
  const activarBrillo = (setter: (v: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 400);
  };

  const addIngreso = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${API}/ingresos`, { monto: montoI, descripcion: descI, fecha: fechaI }, authHeader());
    setMontoI(''); setDescI(''); setFechaI(hoy());
    mostrarExito('Ingreso agregado');
    activarBrillo(setIngresoBrilla);
    fetchData();
  };

  const addGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(montoG) > resumen.balance) {
      alert('No puedes gastar más de tu balance disponible');
      return;
    }
    await axios.post(`${API}/gastos`, { monto: montoG, descripcion: descG, fecha: fechaG, categoria_id: catG }, authHeader());
    setMontoG(''); setDescG(''); setFechaG(hoy()); setCatG('');
    mostrarExito('Gasto agregado');
    activarBrillo(setGastoBrilla);
    fetchData();
  };

  const deleteIngreso = async (id: number) => {
    await axios.delete(`${API}/ingresos/${id}`, authHeader());
    fetchData();
  };

  const deleteGasto = async (id: number) => {
    await axios.delete(`${API}/gastos/${id}`, authHeader());
    fetchData();
  };

  /** Aplica filtros de fecha y categoría a la lista de gastos (e ingresos por fecha) */
  const filtrarGastos = async () => {
    const gastoParams: any = {};
    if (filtroDesde)     gastoParams.desde        = filtroDesde;
    if (filtroHasta)     gastoParams.hasta         = filtroHasta;
    if (filtroCategoria) gastoParams.categoria_id  = filtroCategoria;

    const [gastosRes, ingresosRes] = await Promise.all([
      axios.get(`${API}/gastos`,   { headers: authHeader().headers, params: gastoParams }),
      axios.get(`${API}/ingresos`, { headers: authHeader().headers, params: {
        ...(filtroDesde && { desde: filtroDesde }),
        ...(filtroHasta && { hasta: filtroHasta }),
      }}),
    ]);

    setGastos(gastosRes.data);
    setIngresos(ingresosRes.data);
  };

  //  Render 

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8' }}>

      {/* Barra de navegación */}
      <AppBar position="static">
        <Toolbar>
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{ height: 40, mr: 2, objectFit: 'contain' }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Gastos Personales</Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>Hola, {username}</Typography>
          <Button color="inherit" onClick={logout}>Cerrar Sesión</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/*  Tarjetas de resumen  */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Ingresos',     value: resumen.totalIngresos, color: '#2e7d32' },
            { label: 'Total Gastos',       value: resumen.totalGastos,   color: '#c62828' },
            { label: 'Balance Disponible', value: resumen.balance,       color: resumen.balance >= 0 ? '#1565c0' : '#c62828' },
          ].map(item => (
            <Grid item xs={12} md={4} key={item.label}>
              <Card
                elevation={3}
                sx={{
                  backgroundColor:
                    item.label === 'Total Ingresos' && ingresoBrilla ? '#e6f9ec' :
                    item.label === 'Total Gastos'   && gastoBrilla   ? '#fde0e2' : '#fff',
                  transition: ingresoBrilla || gastoBrilla ? 'none' : 'background-color 0.8s ease',
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: item.color }}>
                    {fmt(item.value)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ── Pestañas  */}
        <Paper elevation={2}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Agregar Ingreso" />
            <Tab label="Agregar Gasto" />
            <Tab label="Movimientos" />
            <Tab label="Gráficas" />
          </Tabs>

          {/* ── Tab 0: Agregar Ingreso  */}
          {tab === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Nuevo Ingreso</Typography>

              <Box component="form" onSubmit={addIngreso}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Monto" type="number" required
                      value={montoI} onChange={e => setMontoI(e.target.value)}
                      inputProps={{ min: 0, step: '0.01' }} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Descripción"
                      value={descI} onChange={e => setDescI(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Fecha" type="date" required
                      value={fechaI} onChange={e => setFechaI(e.target.value)}
                      InputLabelProps={{ shrink: true }} />
                  </Grid>
                </Grid>
                <Button type="submit" variant="contained" color="success" startIcon={<AddIcon />} sx={{ mt: 2 }}>
                  Agregar Ingreso
                </Button>
              </Box>

              {/* Tabla de los últimos 5 ingresos */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1, color: '#2e7d32' }}>
                Ingresos
              </Typography>
              <TablaIngresos rows={ingresos.slice(0, 5)} onDelete={deleteIngreso} fmt={fmt} />
            </Box>
          )}

          {/* ── Tab 1: Agregar Gasto  */}
          {tab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Nuevo Gasto</Typography>

              <Box component="form" onSubmit={addGasto}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <TextField fullWidth label="Monto" type="number" required
                      value={montoG} onChange={e => setMontoG(e.target.value)}
                      inputProps={{ min: 0, step: '0.01' }} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField fullWidth label="Descripción"
                      value={descG} onChange={e => setDescG(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField fullWidth label="Fecha" type="date" required
                      value={fechaG} onChange={e => setFechaG(e.target.value)}
                      InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth required>
                      <InputLabel>Categoría</InputLabel>
                      <Select value={catG} label="Categoría" onChange={e => setCatG(e.target.value)}>
                        {categorias.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Button type="submit" variant="contained" color="error" startIcon={<AddIcon />} sx={{ mt: 2 }}>
                  Agregar Gasto
                </Button>
              </Box>

              {/* Tabla de los últimos 5 gastos */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1, color: '#c62828' }}>
                Gastos
              </Typography>
              <TablaGastos rows={gastos.slice(0, 5)} onDelete={deleteGasto} fmt={fmt} />
            </Box>
          )}

          {/* ── Tab 2: Movimientos (con filtros)  */}
          {tab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Filtrar Gastos</Typography>

              {/* Controles de filtro */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Desde" type="date"
                    value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Hasta" type="date"
                    value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Categoría</InputLabel>
                    <Select value={filtroCategoria} label="Categoría"
                      onChange={e => setFiltroCategoria(e.target.value as string)}>
                      <MenuItem value="">Todas</MenuItem>
                      {categorias.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button variant="outlined" onClick={filtrarGastos} fullWidth>Filtrar</Button>
                </Grid>
              </Grid>

              {/* Lista completa de ingresos */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: '#2e7d32' }}>
                Ingresos
              </Typography>
              <TablaIngresos rows={ingresos} onDelete={deleteIngreso} fmt={fmt} scrollable />

              {/* Lista completa de gastos */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1, color: '#c62828' }}>
                Gastos
              </Typography>
              <TablaGastos rows={gastos} onDelete={deleteGasto} fmt={fmt} scrollable />
            </Box>
          )}

          {/* ── Tab 3: Gráficas  */}
          {tab === 3 && (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>

              {/* Gráfica de torta: gastos por categoría */}
              <Typography variant="h6" gutterBottom>Gastos por Categoría</Typography>
              <GraficaTorta etiquetas={etiquetas} valores={valores} totalGastos={totalGastos} />

              <Divider sx={{ my: 10, width: '100%' }}>
                <Typography variant="caption">Gráfica de barra</Typography>
              </Divider>

              {/* Selector de año compartido entre ambas barras */}
              <FormControl sx={{ mt: 2, mb: 3, minWidth: 120 }}>
                <InputLabel>Año</InputLabel>
                <Select value={anioSeleccionado} label="Año"
                  onChange={e => setAnioSeleccionado(Number(e.target.value))}>
                  {ANIOS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                </Select>
              </FormControl>

              {/* Barras de gastos por mes */}
              <GraficaBarras
                titulo={`Gastos de (${anioSeleccionado})`}
                datos={gastosPorMes}
                max={maxGastos}
                color="#c81505"
              />

              {/* Barras de ingresos por mes */}
              <Box sx={{ mt: 6, width: '100%' }}>
                <GraficaBarras
                  titulo={`Ingresos de (${anioSeleccionado})`}
                  datos={ingresosPorMes}
                  max={maxIngresos}
                  color="#2e7d32"
                />
              </Box>

            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;

// ─── Sub-componentes 

// Props compartidas por ambas tablas
interface TablaBaseProps {
  onDelete: (id: number) => void;
  fmt: (n: number) => string;
  scrollable?: boolean;
}

/** Tabla de ingresos reutilizable (usada en Tab 0 y Tab 2) */
const TablaIngresos: React.FC<TablaBaseProps & { rows: Movimiento[] }> = ({ rows, onDelete, fmt, scrollable }) => (
  <TableContainer component={Paper} sx={scrollable ? { maxHeight: 400, mb: 3 } : { mb: 3 }}>
    <Table stickyHeader={scrollable} size="small">
      <TableHead>
        <TableRow sx={{ bgcolor: '#e8f5e9' }}>
          {['Fecha', 'Descripción', 'Monto', 'Eliminar'].map(col => (
            <TableCell key={col}
              align={col === 'Monto' ? 'right' : col === 'Eliminar' ? 'center' : 'left'}
              sx={{ color: '#2e7d32', bgcolor: '#e8f5e9' }}>
              {col}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow><TableCell colSpan={4} align="center">Sin ingresos registrados</TableCell></TableRow>
        ) : rows.map(i => (
          <TableRow key={i.id}>
            <TableCell>{i.fecha?.split('T')[0]}</TableCell>
            <TableCell>{i.descripcion || '-'}</TableCell>
            <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>{fmt(i.monto)}</TableCell>
            <TableCell align="center">
              <IconButton size="small" onClick={() => onDelete(i.id)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

/** Tabla de gastos reutilizable (usada en Tab 1 y Tab 2) */
const TablaGastos: React.FC<TablaBaseProps & { rows: Movimiento[] }> = ({ rows, onDelete, fmt, scrollable }) => (
  <TableContainer component={Paper} sx={scrollable ? { maxHeight: 400 } : {}}>
    <Table stickyHeader={scrollable} size="small">
      <TableHead>
        <TableRow>
          {['Fecha', 'Descripción', 'Categoría', 'Monto', 'Eliminar'].map(col => (
            <TableCell key={col}
              align={col === 'Monto' ? 'right' : col === 'Eliminar' ? 'center' : 'left'}
              sx={{ color: '#c62828', bgcolor: '#ffebee' }}>
              {col}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow><TableCell colSpan={5} align="center">Sin gastos registrados</TableCell></TableRow>
        ) : rows.map(g => (
          <TableRow key={g.id}>
            <TableCell>{g.fecha?.split('T')[0]}</TableCell>
            <TableCell>{g.descripcion || '-'}</TableCell>
            <TableCell><Chip label={g.categoria_nombre || '-'} size="small" /></TableCell>
            <TableCell align="right" sx={{ color: '#c62828', fontWeight: 'bold' }}>{fmt(g.monto)}</TableCell>
            <TableCell align="center">
              <IconButton size="small" onClick={() => onDelete(g.id)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

/** Gráfica de torta construida con conic-gradient */
const GraficaTorta: React.FC<{ etiquetas: string[]; valores: number[]; totalGastos: number }> = ({
  etiquetas, valores, totalGastos,
}) => {
  const gradient = etiquetas.map((_, i) => {
    const start = i === 0 ? 0 : valores.slice(0, i).reduce((a, b) => a + b, 0);
    const end   = start + valores[i];
    const startPct = (start / totalGastos) * 100;
    const endPct   = (end   / totalGastos) * 100;
    return `${COLOR_PALETTE[i % COLOR_PALETTE.length]} ${startPct}% ${endPct}%`;
  }).join(',');

  return (
    <>
      <Box sx={{
        width: 300, height: 300, borderRadius: '50%',
        background: totalGastos > 0 ? `conic-gradient(${gradient})` : '#e0e0e0',
      }} />
      <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {etiquetas.map((cat, i) => (
          <Box key={cat} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: COLOR_PALETTE[i % COLOR_PALETTE.length] }} />
            <Typography variant="body2">
              {cat}: {valores[i].toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
};

/** Gráfica de barras verticales por mes */
const GraficaBarras: React.FC<{ titulo: string; datos: number[]; max: number; color: string }> = ({
  titulo, datos, max, color,
}) => (
  <Box sx={{ width: '100%' }}>
    <Typography variant="h6" gutterBottom>{titulo}</Typography>
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 200 }}>
      {datos.map((valor, i) => (
        <Box key={i} sx={{ flex: 1, textAlign: 'center' }}>
          <Box sx={{
            height: valor > 0 ? `${(valor / max) * 180}px` : '2px',
            bgcolor: color,
            borderRadius: 1,
          }} />
          <Typography variant="caption">{MESES[i]}</Typography>
        </Box>
      ))}
    </Box>
    <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      {datos.map((valor, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 0.5 }}>
          <Typography variant="body2" fontWeight="bold">{MESES[i]}:</Typography>
          <Typography variant="body2">
            {valor.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);