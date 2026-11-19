export const PERFIS = {
  admin_geral: 'Admin Geral',
  admin_oficina: 'Admin da Oficina',
  funcionario: 'Funcionário',
  cliente: 'Cliente',
};

export const OS_STATUS = {
  aguardando_aprovacao: { label: 'Aguardando aprovação', badge: 'warning' },
  em_andamento: { label: 'Em andamento', badge: 'info' },
  aguardando_pecas: { label: 'Aguardando peças', badge: 'purple' },
  concluida: { label: 'Concluída', badge: 'success' },
  cancelada: { label: 'Cancelada', badge: 'danger' },
};

export const ORCAMENTO_STATUS = {
  pendente: { label: 'Pendente de aprovação', badge: 'warning' },
  aprovado: { label: 'Aprovado', badge: 'success' },
  recusado: { label: 'Recusado', badge: 'danger' },
};

export const AGENDAMENTO_STATUS = {
  pendente: { label: 'Pendente', badge: 'warning' },
  confirmado: { label: 'Confirmado', badge: 'info' },
  concluido: { label: 'Concluído', badge: 'success' },
  cancelado: { label: 'Cancelado', badge: 'danger' },
};

export const VINCULO_STATUS = {
  autorizado: { label: 'Autorizado', badge: 'success' },
  revogado: { label: 'Revogado', badge: 'danger' },
};

export const COMBUSTIVEIS = ['Gasolina', 'Etanol', 'Flex', 'Diesel', 'Híbrido', 'Elétrico', 'GNV'];

export const QUICK_CREDENTIALS = [
  {
    perfil: 'Admin Geral',
    email: 'admin@autotrackpro.com',
    senha: 'Admin@123',
    descricao: 'Visão global da plataforma',
  },
  {
    perfil: 'Admin Oficina',
    email: 'oficina1@autotrackpro.com',
    senha: 'Oficina@123',
    descricao: 'Gestão completa da oficina 1',
  },
  {
    perfil: 'Funcionário',
    email: 'func1@autotrackpro.com',
    senha: 'Func@123',
    descricao: 'OS, estoque e agendamentos',
  },
  {
    perfil: 'Cliente',
    email: 'cliente1@autotrackpro.com',
    senha: 'Cliente@123',
    descricao: 'Garagem digital e aprovações',
  },
];

export const NAV_OFICINA = [
  { to: '/app/oficina', label: 'Visão geral', icon: 'LayoutDashboard' },
  { to: '/app/oficina/os', label: 'Ordens de serviço', icon: 'Wrench' },
  { to: '/app/oficina/orcamentos', label: 'Orçamentos', icon: 'FileText' },
  { to: '/app/oficina/agendamentos', label: 'Agendamentos', icon: 'CalendarDays' },
  { to: '/app/oficina/veiculos', label: 'Veículos', icon: 'CarFront' },
  { to: '/app/oficina/estoque', label: 'Estoque', icon: 'Package' },
  { to: '/app/oficina/relatorios', label: 'Relatórios', icon: 'ChartNoAxesCombined' },
  { to: '/app/oficina/funcionarios', label: 'Equipe', icon: 'Users', adminOnly: true },
  { to: '/app/oficina/empresa', label: 'Dados da empresa', icon: 'Building2', adminOnly: true },
];

export const NAV_CLIENTE = [
  { to: '/app/cliente', label: 'Visão geral', icon: 'LayoutDashboard' },
  { to: '/app/cliente/garagem', label: 'Minha garagem', icon: 'CarFront' },
  { to: '/app/cliente/orcamentos', label: 'Orçamentos', icon: 'FileText' },
  { to: '/app/cliente/agendamentos', label: 'Agendamentos', icon: 'CalendarDays' },
  { to: '/app/cliente/historico', label: 'Histórico digital', icon: 'History' },
  { to: '/app/cliente/perfil', label: 'Meu perfil', icon: 'UserRound' },
];

export const NAV_ADMIN = [
  { to: '/app/admin', label: 'Visão global', icon: 'LayoutDashboard' },
  { to: '/app/admin/oficinas', label: 'Oficinas', icon: 'Building2' },
  { to: '/app/admin/usuarios', label: 'Usuários', icon: 'Users' },
];
