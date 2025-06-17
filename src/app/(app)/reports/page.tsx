"use client";

import {
  FileText,
  History,
  PieChart,
  BarChartHorizontalBig,
  Download,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker";
import { getSalesReport, getInventoryReport, getServiceOrdersReport, getFinancialReport } from "@/data/report";
import { ReportCard } from "@/components/ReportCard";
import { SalesTable } from "./components/sales-table";
import { FinancialTable } from "./components/financial-table";
import { InventoryTable } from "./components/inventory-table";
import { ServiceOrdersTable } from "./components/service-orders-table";

export default function ReportsPage() {
  const [salesDate, setSalesDate] = useState<DateRange | undefined>();
  const [financialDate, setFinancialDate] = useState<DateRange | undefined>();
  const [osDate, setOsDate] = useState<DateRange | undefined>();

  const [salesData, setSalesData] = useState<any[] | null>(null);
  const [financialData, setFinancialData] = useState<any[] | null>(null);
  const [osData, setOsData] = useState<any[] | null>(null);
  const [inventoryData, setInventoryData] = useState<any[] | null>(null);

  const [loading, setLoading] = useState({
    sales: false,
    financial: false,
    os: false,
    inventory: false,
  });

  const [errors, setErrors] = useState({
    sales: "",
    financial: "",
    os: "",
    inventory: "",
  });

  async function generateSalesReport() {
    if (!salesDate?.from || !salesDate?.to) return;
    setLoading((prev) => ({ ...prev, sales: true }));
    try {
      const data = await getSalesReport(salesDate.from, salesDate.to);
      setSalesData(data);
      setErrors((prev) => ({ ...prev, sales: "" }));
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, sales: error.message }));
    } finally {
      setLoading((prev) => ({ ...prev, sales: false }));
    }
  }

  async function generateFinancialReport() {
    if (!financialDate?.from || !financialDate?.to) return;
    setLoading((prev) => ({ ...prev, financial: true }));
    try {
      const data = await getFinancialReport(financialDate.from, financialDate.to);
      setFinancialData(data);
      setErrors((prev) => ({ ...prev, financial: "" }));
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, financial: error.message }));
    } finally {
      setLoading((prev) => ({ ...prev, financial: false }));
    }
  }

  async function generateServiceOrdersReport() {
    if (!osDate?.from || !osDate?.to) return;
    setLoading((prev) => ({ ...prev, os: true }));
    try {
      const data = await getServiceOrdersReport(osDate.from, osDate.to);
      setOsData(data);
      setErrors((prev) => ({ ...prev, os: "" }));
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, os: error.message }));
    } finally {
      setLoading((prev) => ({ ...prev, os: false }));
    }
  }

  async function generateInventoryReport() {
    setLoading((prev) => ({ ...prev, inventory: true }));
    try {
      const data = await getInventoryReport();
      setInventoryData(data);
      setErrors((prev) => ({ ...prev, inventory: "" }));
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, inventory: error.message }));
    } finally {
      setLoading((prev) => ({ ...prev, inventory: false }));
    }
  }

  return (
    <div className="space-y-4">
      {/* Relatório de Vendas */}
      <ReportCard
        icon={<BarChartHorizontalBig />}
        title="Relatório de Vendas"
        description="Visualize todas as vendas realizadas por período."
        onGenerate={generateSalesReport}
        disabled={!salesDate?.from || !salesDate?.to || loading.sales}
        isLoading={loading.sales}
        error={errors.sales}
      >
        <CalendarDateRangePicker date={salesDate} setDate={setSalesDate} />
        {salesData && (
          <>
            {salesData.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma venda encontrada para o período selecionado.
              </p>
            ) : (
              <SalesTable data={salesData} />
            )}
          </>
        )}
      </ReportCard>

      {/* Relatório de Ordens de Serviço */}
      <ReportCard
        icon={<History />}
        title="Relatório de Ordens de Serviço"
        description="Veja todas as ordens de serviço realizadas por período."
        onGenerate={generateServiceOrdersReport}
        disabled={!osDate?.from || !osDate?.to || loading.os}
        isLoading={loading.os}
        error={errors.os}
      >
        <CalendarDateRangePicker date={osDate} setDate={setOsDate} />
        {osData && (
          <>
            {osData.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma OS encontrada para o período selecionado.
              </p>
            ) : (
              <ServiceOrdersTable data={osData} />
            )}
          </>
        )}
      </ReportCard>

      {/* Relatório Financeiro */}
      <ReportCard
        icon={<PieChart />}
        title="Relatório Financeiro"
        description="Veja todas as entradas e saídas do caixa por período."
        onGenerate={generateFinancialReport}
        disabled={!financialDate?.from || !financialDate?.to || loading.financial}
        isLoading={loading.financial}
        error={errors.financial}
      >
        <CalendarDateRangePicker date={financialDate} setDate={setFinancialDate} />
        {financialData && (
          <>
            {financialData.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum dado financeiro encontrado para o período selecionado.
              </p>
            ) : (
              <FinancialTable data={financialData} />
            )}
          </>
        )}
      </ReportCard>

      {/* Relatório de Inventário */}
      <ReportCard
        icon={<FileText />}
        title="Relatório de Inventário"
        description="Veja todos os produtos cadastrados com suas quantidades em estoque."
        onGenerate={generateInventoryReport}
        disabled={loading.inventory}
        isLoading={loading.inventory}
        error={errors.inventory}
      >
        {inventoryData && (
          <>
            {inventoryData.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum item no estoque.
              </p>
            ) : (
              <InventoryTable data={inventoryData} />
            )}
          </>
        )}
      </ReportCard>
    </div>
  );
}
