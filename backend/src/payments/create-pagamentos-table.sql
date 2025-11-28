-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  empresa_id BIGINT NOT NULL,
  consulta_id UUID REFERENCES public.consultas(id) ON DELETE SET NULL,
  paciente_id INTEGER NOT NULL,
  valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
  forma_pagamento TEXT NOT NULL CHECK (forma_pagamento IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia')),
  data_pagamento DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  descricao TEXT,
  confirmado BOOLEAN DEFAULT true,
  
  CONSTRAINT pagamentos_empresa_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresa(id) ON DELETE CASCADE,
  CONSTRAINT pagamentos_consulta_fkey FOREIGN KEY (consulta_id) REFERENCES public.consultas(id) ON DELETE SET NULL,
  CONSTRAINT pagamentos_paciente_fkey FOREIGN KEY (paciente_id) REFERENCES public."clientelA"(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_empresa_id ON public.pagamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_paciente_id ON public.pagamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_consulta_id ON public.pagamentos(consulta_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data_pagamento ON public.pagamentos(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_confirmado ON public.pagamentos(confirmado);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_pagamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON public.pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_pagamentos_updated_at();

-- Comentários nas colunas
COMMENT ON TABLE public.pagamentos IS 'Registros de pagamentos de consultas e procedimentos';
COMMENT ON COLUMN public.pagamentos.empresa_id IS 'ID da empresa (multi-tenancy)';
COMMENT ON COLUMN public.pagamentos.consulta_id IS 'ID da consulta relacionada (opcional)';
COMMENT ON COLUMN public.pagamentos.paciente_id IS 'ID do paciente';
COMMENT ON COLUMN public.pagamentos.valor IS 'Valor do pagamento em R$';
COMMENT ON COLUMN public.pagamentos.forma_pagamento IS 'Forma de pagamento: dinheiro, cartao_credito, cartao_debito, pix, transferencia';
COMMENT ON COLUMN public.pagamentos.data_pagamento IS 'Data em que o pagamento foi realizado';
COMMENT ON COLUMN public.pagamentos.confirmado IS 'Se o pagamento está confirmado';

