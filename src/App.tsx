
import { useState } from 'react';

import { useExpedientes } from './hooks/useExpedientes';

import FormularioApertura from './features/apertura/FormularioApertura';
import ListadoExpedientes from './features/listado/ListadoExpedientes';
import { DetalleExpediente } from './features/detalle/DetalleExpediente';

type Navegacion = {
  vista: 'listado' | 'nuevo' | 'detalle';
  idSeleccionado?: string;
};

function App() {
  const [navegacion, setNavegacion] = useState<Navegacion>({
    vista: 'listado',
  });

  const {
    expedientes,
    crear,
    agregarActividad,
    pasarASeguimiento,
    cerrar,
    reabrir,
    buscar,
  } = useExpedientes();

  // Regresar al listado
  const volverAlListado = () => {
    setNavegacion({ vista: 'listado' });
  };

  // Abrir formulario de nuevo expediente
  const abrirFormulario = () => {
    setNavegacion({ vista: 'nuevo' });
  };

  // Abrir detalle de un expediente
  const verDetalle = (id: string) => {
    setNavegacion({
      vista: 'detalle',
      idSeleccionado: id,
    });
  };

  // Crear expediente y abrir su detalle
  const crearExpediente = (input: Parameters<typeof crear>[0]) => {
    const resultado = crear(input);

    if (resultado.ok) {
      setNavegacion({
        vista: 'detalle',
        idSeleccionado: resultado.data.id,
      });
    }

    return resultado;
  };

  // Buscar el expediente seleccionado
  const expedienteSeleccionado = expedientes.find(
    (expediente) => expediente.id === navegacion.idSeleccionado
  );

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100 text-slate-900">

      {/* Encabezado */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Sistema de Gestión de Expedientes
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              Bufete Popular · Gestión y seguimiento de expedientes
            </p>
          </div>

          <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2">
            <p className="text-sm font-medium text-amber-200">
              Prototipo con datos ficticios. No brinda asesoría jurídica.
            </p>
          </div>

        </div>
      </header>

      {/* Contenido principal */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">

        {navegacion.vista === 'listado' && (
          <ListadoExpedientes
            buscar={buscar}
            total={expedientes.length}
            onVerDetalle={verDetalle}
            onNuevo={abrirFormulario}
          />
        )}

        {navegacion.vista === 'nuevo' && (
          <FormularioApertura
            onCrear={crearExpediente}
            onCancelar={volverAlListado}
          />
        )}

        {navegacion.vista === 'detalle' && (
          expedienteSeleccionado ? (
            <DetalleExpediente
              expediente={expedienteSeleccionado}
              onAgregarActividad={(descripcion, tipo) =>
                agregarActividad(
                  expedienteSeleccionado.id,
                  descripcion,
                  tipo
                )
              }
              onPasarASeguimiento={() =>
                pasarASeguimiento(expedienteSeleccionado.id)
              }
              onCerrar={(motivo) =>
                cerrar(expedienteSeleccionado.id, motivo)
              }
              onReabrir={(motivo) =>
                reabrir(expedienteSeleccionado.id, motivo)
              }
              onVolver={volverAlListado}
            />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-lg font-semibold">
                Expediente no encontrado
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                El expediente seleccionado no existe o ya no está disponible.
              </p>

              <button
                onClick={volverAlListado}
                className="mt-5 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Volver al listado
              </button>
            </div>
          )
        )}

      </main>

      {/* Pie de página */}
      <footer className="mt-auto bg-slate-900 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-1 px-4 py-4 text-center text-xs sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <p>
            <span className="font-semibold text-white">AI CODE WARS</span> · Tech Day UMG 2026
          </p>
          <p className="text-slate-400">
            Bufete Popular · Prototipo con datos ficticios, sin asesoría jurídica.
          </p>
        </div>
      </footer>

    </div>
  );
}

export default App;
