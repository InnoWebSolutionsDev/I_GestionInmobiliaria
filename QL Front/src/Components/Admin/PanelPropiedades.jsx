
import { Link, useNavigate } from 'react-router-dom';
import { 
  IoLogOutOutline, 
  IoHomeOutline, 
  IoAddOutline, 
  IoListOutline, 
  IoFilterOutline,
  IoArrowBackOutline,
  IoBusinessOutline,
  IoStatsChartOutline,
  IoLocationOutline,
  IoPricetagOutline
} from 'react-icons/io5';

const PanelPropiedades = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/panel');
  };

  const propertyActions = [
    {
      title: 'Alta Propiedades',
      path: '/cargarPropiedad',
      icon: IoAddOutline,
      gradient: 'from-emerald-500 to-emerald-600',
      hoverGradient: 'from-emerald-600 to-emerald-700',
      description: 'Agregar nueva propiedad'
    },
    {
      title: 'Filtro',
      path: '/filtro',
      icon: IoFilterOutline,
      gradient: 'from-amber-500 to-orange-500',
      hoverGradient: 'from-amber-600 to-orange-600',
      description: 'Filtrar propiedades'
    },
    {
      title: 'Listado',
      path: '/listadoDePropiedades',
      icon: IoListOutline,
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'from-blue-600 to-blue-700',
      description: 'Ver todas las propiedades'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="w-full bg-white/10 backdrop-blur-md border-b border-white/20 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link 
              to="/panel" 
              className="text-white hover:text-blue-300 transition-colors duration-300 flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30"
            >
              <IoArrowBackOutline className="w-5 h-5" />
              <span className="hidden sm:inline">Volver al Panel</span>
            </Link>
            
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-slate-300">
              <Link to="/panel" className="hover:text-white transition-colors">
                <IoHomeOutline className="w-4 h-4" />
              </Link>
              <span>/</span>
              <span className="text-white font-medium">Propiedades</span>
            </nav>
          </div>
          
          <button
            onClick={handleLogout}
            className="text-white flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 transition-all duration-300"
          >
            <span className="hidden sm:inline">Cerrar Sesión</span>
            <span className="sm:hidden">Salir</span>
            <IoLogOutOutline className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-emerald-500/20 rounded-full">
              <IoBusinessOutline className="w-12 h-12 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Gestión de Propiedades
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Administra tu cartera inmobiliaria de manera eficiente
          </p>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {propertyActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className={`group relative bg-gradient-to-br ${action.gradient} hover:${action.hoverGradient} p-8 sm:p-12 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/10`}
              >
                <div className="flex flex-col items-center space-y-6 text-white">
                  <div className="p-6 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300">
                    <IconComponent className="w-12 h-12 sm:w-16 sm:h-16" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{action.title}</h3>
                    <p className="text-white/80 text-sm sm:text-base">{action.description}</p>
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <IoStatsChartOutline className="w-6 h-6 mr-2 text-emerald-400" />
            Estadísticas de Propiedades
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Propiedades', value: '--', icon: IoBusinessOutline, color: 'text-emerald-400' },
              { label: 'Disponibles', value: '--', icon: IoHomeOutline, color: 'text-blue-400' },
              { label: 'Vendidas/Alquiladas', value: '--', icon: IoPricetagOutline, color: 'text-amber-400' },
              { label: 'En Proceso', value: '--', icon: IoLocationOutline, color: 'text-purple-400' }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex justify-center mb-2">
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-slate-300 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300 cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <IoAddOutline className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">Carga Rápida</p>
                <p className="text-xs text-slate-300">Nueva propiedad</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300 cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <IoFilterOutline className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Búsqueda Avanzada</p>
                <p className="text-xs text-slate-300">Filtros personalizados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300 cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <IoListOutline className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white font-medium">Reporte</p>
                <p className="text-xs text-slate-300">Exportar datos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelPropiedades;