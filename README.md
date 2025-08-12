# 🚀 Microserviço de Produtos

Um microserviço simples para gerenciamento de produtos usando Node.js, gRPC e Kubernetes.

## 📋 O que é este projeto?

- **Microserviço gRPC**: Servidor que responde a requisições
- **Hello World**: Endpoint básico para testar
- **Kubernetes**: Deploy automatizado em cluster
- **PostgreSQL**: Banco de dados master/slave

## 🏗️ Arquitetura de Deploy

```
┌────────────────────────────────────────────────────────────────────┐
│                        Kubernetes Cluster                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │   Products      │    │  PostgreSQL     │    │  PostgreSQL     │ │
│  │   Microservice  │◄──►│     Master      │◄──►│     Slave       │ │
│  │   (gRPC)        │    │   (Write)       │    │   (Read)        │ │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘ │
│           │                       │                       │        │
│           ▼                       ▼                       ▼        │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │   Products      │    │  postgres-      │    │  postgres-      │ │
│  │   Service       │    │  write          │    │  read           │ │
│  │   (50051)       │    │  Service        │    │  Service        │ │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘ │
│           │                       │                       │        │
│           ▼                       ▼                       ▼        │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │   Products      │    │  postgres-      │    │  postgres-      │ │
│  │   HPA           │    │  master-hpa     │    │  slave-hpa      │ │
│  │   (1-10 pods)   │    │  (1-3 pods)     │    │  (1-5 pods)     │ │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## 📊 Configurações Detalhadas

### 🛠️ Microserviço de Produtos

#### Deployment (`deployment.yaml`)
- **Replicas**: 1 (inicial)
- **Imagem**: `products-microservice:latest`
- **Porta**: 50051 (gRPC)
- **Recursos**: 100m-200m CPU, 128Mi-256Mi Memory
- **Image Pull Policy**: Never (para imagens locais)

#### Service (`service.yaml`)
- **Tipo**: ClusterIP
- **Porta**: 50051
- **Seletor**: `app: products`

#### HPA (`products-hpa.yaml`)
- **Min Replicas**: 1
- **Max Replicas**: 10
- **CPU Target**: 70%
- **Memory Target**: 80%
- **Scale Up**: 60s stabilization, 15s period
- **Scale Down**: 300s stabilization, 60s period

### 🗄️ PostgreSQL Master

#### Deployment (`db-deployment.yaml`)
- **Replicas**: 1
- **Imagem**: `postgres:16`
- **Porta**: 5432
- **Recursos**: 250m-500m CPU, 256Mi-512Mi Memory
- **Variáveis de Ambiente**:
  - `POSTGRES_DB`: productsdb
  - `POSTGRES_USER`: postgres
  - `POSTGRES_PASSWORD`: postgres

#### Service (`db-service.yaml`)
- **Tipo**: ClusterIP
- **Porta**: 5432
- **Seletor**: `app: postgres, role: master`

#### PVC (`db-pvc.yaml`)
- **Storage**: 1Gi
- **Access Mode**: ReadWriteOnce
- **Storage Class**: standard

#### HPA (`postgres-master-hpa.yaml`)
- **Min Replicas**: 1
- **Max Replicas**: 3
- **CPU Target**: 60%
- **Memory Target**: 70%

### 🗄️ PostgreSQL Slave

#### Deployment (`db-slave-deployment.yaml`)
- **Replicas**: 1
- **Imagem**: `postgres:16`
- **Porta**: 5432
- **Recursos**: 250m-500m CPU, 256Mi-512Mi Memory
- **Variáveis de Ambiente**: Mesmas do master

#### Service (`db-slave-service.yaml`)
- **Tipo**: ClusterIP
- **Porta**: 5432
- **Seletor**: `app: postgres, role: slave`

#### PVC (`db-slave-pvc.yaml`)
- **Storage**: 1Gi
- **Access Mode**: ReadWriteOnce
- **Storage Class**: standard

#### HPA (`postgres-slave-hpa.yaml`)
- **Min Replicas**: 1
- **Max Replicas**: 5
- **CPU Target**: 60%
- **Memory Target**: 70%

### 🔄 Services de Leitura/Escrita

#### Read/Write Services (`db-read-write-service.yaml`)
- **postgres-write**: Aponta para master (escritas)
- **postgres-read**: Aponta para slave (leituras)

## ⚙️ Pré-requisitos

Você precisa ter instalado:
- **Node.js** (versão 20 ou superior)
- **Docker**
- **Minikube** (para Kubernetes local)
- **kubectl** (cliente Kubernetes)

> 💡 **Dica**: Instale essas ferramentas seguindo a documentação oficial de cada uma.

## 🚀 Como Rodar

### 1. Clone o Projeto
```bash
git clone git@github.com:trabalhomatheus/MS-produtos.git
cd products-microservice
```

### 2. Instale as Dependências
```bash
npm install
```

## 🐳 Rodar com Docker (Mais Simples)

### Construir e Executar
```bash
# Construir a imagem
docker build -t products-microservice:latest .

# Executar o container
docker run -p 50051:50051 products-microservice:latest
```


## ☸️ Rodar com Kubernetes (Mais Avançado)

### 1. Iniciar Kubernetes Local

**Linux/macOS:**
```bash
# Iniciar Minikube
minikube start --driver=docker

# Habilitar recursos necessários
minikube addons enable metrics-server
minikube addons enable storage-provisioner
```

**Windows:**
```cmd
# Iniciar Minikube
minikube start --driver=docker

# Habilitar recursos necessários
minikube addons enable metrics-server
minikube addons enable storage-provisioner
```

### 2. Configurar e Deployar

**Linux/macOS:**
```bash
# Configurar Docker
eval $(minikube docker-env)

# Construir imagem
docker build -t products-microservice:latest .

# Deployar tudo
kubectl apply -k deploy/
```

**Windows:**
```cmd
# Configurar Docker
minikube docker-env | Invoke-Expression

# Construir imagem
docker build -t products-microservice:latest .

# Deployar tudo
kubectl apply -k deploy/
```

### 3. Verificar se Está Rodando
```bash
# Ver pods
kubectl get pods

# Ver serviços
kubectl get services
```

### 4. Acessar a Aplicação
```bash
# Conectar ao serviço
kubectl port-forward service/products 50051:50051

# Em outro terminal, testar
curl -v telnet://localhost:50051
```


## 📊 Ver Logs e Status

```bash
# Logs da aplicação
kubectl logs -l app=products

# Status dos pods
kubectl get pods

# Status dos serviços
kubectl get services
```

## 🧹 Limpar Tudo

**Linux/macOS:**
```bash
# Parar port-forward
pkill -f "kubectl port-forward"

# Remover deploy
kubectl delete -k deploy/

# Parar Minikube
minikube stop
```

**Windows:**
```cmd
# Parar port-forward
taskkill /f /im kubectl.exe

# Remover deploy
kubectl delete -k deploy/

# Parar Minikube
minikube stop
```

## 🆘 Problemas Comuns

### Erro de Imagem Docker
```bash
# Reconstruir a imagem
eval $(minikube docker-env)  # Linux/macOS
# ou
minikube docker-env | Invoke-Expression  # Windows
docker build -t products-microservice:latest .
```

### Pod não inicia
```bash
# Ver logs do pod
kubectl logs <nome-do-pod>

# Verificar status
kubectl describe pod <nome-do-pod>
```

### Port-forward não funciona
```bash
# Verificar se o serviço existe
kubectl get service products

# Verificar se o pod está rodando
kubectl get pods -l app=products
```

## 📁 Estrutura do Projeto

```
products-microservice/
├── src/
│   ├── proto/products.proto    # Definição do serviço gRPC
│   ├── services/               # Implementação dos serviços
│   └── server.js              # Servidor principal
├── deploy/                    # Arquivos Kubernetes
├── Dockerfile                 # Configuração Docker
└── package.json              # Dependências Node.js
```
