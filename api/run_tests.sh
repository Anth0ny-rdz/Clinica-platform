#!/bin/bash

# Script para ejecutar tests del backend y generar métricas para tesis
# Autor: Sistema de Testing Médico
# Fecha: Enero 2026

echo "================================================"
echo "  SISTEMA DE TESTING - BACKEND (FastAPI)"
echo "  Proyecto de Titulación"
echo "================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Crear directorio de reportes
mkdir -p reports

echo -e "${BLUE}[1/6]${NC} Instalando dependencias de testing..."
pip install -r requirements-test.txt --quiet

echo -e "${BLUE}[2/6]${NC} Ejecutando tests unitarios..."
pytest tests/test_validaciones.py -v --tb=short

echo -e "${BLUE}[3/6]${NC} Ejecutando tests de API (integración)..."
pytest tests/test_api_endpoints.py -v --tb=short

echo -e "${BLUE}[4/6]${NC} Ejecutando TODOS los tests con cobertura..."
pytest --cov=app \
       --cov-report=html:reports/coverage_html \
       --cov-report=term-missing \
       --cov-report=json:reports/coverage.json \
       --cov-report=xml:reports/coverage.xml \
       --html=reports/pytest_report.html \
       --self-contained-html

echo -e "${BLUE}[5/6]${NC} Generando métricas de complejidad de código..."
radon cc app -a -s > reports/complexity_metrics.txt 2>/dev/null || echo "Radon no disponible"

echo -e "${BLUE}[6/6]${NC} Generando análisis de calidad de código..."
pylint app --output-format=text > reports/pylint_report.txt 2>/dev/null || echo "Pylint no disponible"

echo ""
echo -e "${GREEN}✅ Tests completados!${NC}"
echo ""
echo "📊 REPORTES GENERADOS:"
echo "   - HTML Cobertura:  reports/coverage_html/index.html"
echo "   - Reporte Tests:   reports/pytest_report.html"
echo "   - JSON Cobertura:  reports/coverage.json"
echo "   - XML Cobertura:   reports/coverage.xml"
echo "   - Complejidad:     reports/complexity_metrics.txt"
echo "   - Calidad Código:  reports/pylint_report.txt"
echo ""
echo -e "${YELLOW}💡 Métricas para tu tesis:${NC}"

# Extraer métricas del JSON de cobertura
if [ -f "reports/coverage.json" ]; then
    python3 << 'EOF'
import json

with open('reports/coverage.json', 'r') as f:
    data = json.load(f)
    totals = data['totals']
    
    print(f"   📈 Cobertura de líneas:      {totals['percent_covered']:.2f}%")
    print(f"   📈 Líneas cubiertas:         {totals['covered_lines']}/{totals['num_statements']}")
    print(f"   📈 Branches cubiertos:       {totals.get('covered_branches', 0)}/{totals.get('num_branches', 0)}")
    print(f"   📈 Funciones sin cubrir:     {totals['missing_lines']}")
EOF
fi

echo ""
echo -e "${GREEN}Para ver reportes HTML, abre los archivos .html en tu navegador${NC}"
echo "================================================"
