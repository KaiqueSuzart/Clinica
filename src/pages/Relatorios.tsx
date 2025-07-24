import React from 'react';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

export default function Relatorios() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Métricas e indicadores da clínica</p>
        </div>
        <Button icon={Download}>Exportar Relatório</Button>
      </div>

      {/* Período de Análise */}
      <Card title="Período de Análise">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              defaultValue="2024-01-01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Final
            </label>
            <input
              type="date"
              defaultValue="2024-01-31"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex items-end">
            <Button className="w-full">Atualizar Relatório</Button>
          </div>
        </div>
      </Card>

      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <Calendar className="w-10 h-10 text-blue-600 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Atendimentos</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
              <p className="text-sm text-green-600">+12% vs mês anterior</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <TrendingUp className="w-10 h-10 text-green-600 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Faturamento</p>
              <p className="text-2xl font-bold text-gray-900">R$ 12.450</p>
              <p className="text-sm text-green-600">+8% vs mês anterior</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-yellow-600 font-bold">%</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Taxa de Comparecimento</p>
              <p className="text-2xl font-bold text-gray-900">92%</p>
              <p className="text-sm text-red-600">-2% vs mês anterior</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-purple-600 font-bold">N</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Novos Pacientes</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-green-600">+3 vs mês anterior</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Procedimentos Mais Realizados */}
        <Card title="Procedimentos Mais Realizados" subtitle="Janeiro 2024">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Limpeza</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">15</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Restauração</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">12</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Tratamento de Canal</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">8</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Clareamento</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">5</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Faturamento por Profissional */}
        <Card title="Faturamento por Profissional" subtitle="Janeiro 2024">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Dr. Ana Silva</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">15 atendimentos</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-gray-100">R$ 6.200</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">49.8%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Dr. Pedro Costa</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">20 atendimentos</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-gray-100">R$ 4.150</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">33.3%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Dra. Maria Santos</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">10 atendimentos</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-gray-100">R$ 2.100</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">16.9%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Taxa de Faltas */}
      <Card title="Análise de Faltas" subtitle="Comparativo mensal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">8%</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Taxa de Faltas Janeiro</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">12%</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Taxa de Faltas Dezembro</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">-4%</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Melhoria</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Recomendação:</strong> Continue com as mensagens automáticas de lembrete. 
            A taxa de faltas diminuiu 4% em relação ao mês anterior.
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Recomendação:</strong> Continue com as mensagens automáticas de lembrete. 
            A taxa de faltas diminuiu 4% em relação ao mês anterior.
          </p>
        </div>
      </Card>

      {/* Ações de Exportação */}
      <Card title="Exportar Dados">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" icon={Download}>
            Exportar CSV
          </Button>
          <Button variant="outline" icon={Download}>
            Exportar PDF
          </Button>
          <Button variant="outline" icon={BarChart3}>
            Gerar Gráficos
          </Button>
        </div>
      </Card>
    </div>
  );
}