# Backstage Installation and Deployment Guide

## Overview

This guide provides detailed instructions for installing and deploying Backstage in two modes:
- **Standalone Mode**: Ideal for development and testing environments.
- **High Availability (HA) Mode**: Suitable for production environments requiring fault tolerance and scalability.

## Prerequisites

Before starting, ensure the following are installed and configured on your system:

- **Operating System**: Unix-based (Linux, macOS, or WSL on Windows)
- **Node.js**: Active LTS Release (Install using [nvm](https://github.com/nvm-sh/nvm))
- **npm**: Installed with Node.js for managing packages
- **npx**: Installed with npm for running Node.js packages without globally installing them
- **Yarn**: Yarn Classic
- **Docker**: Installed and running
- **Git**: Installed and configured
- **kubectl**: Installed and configured for your Kubernetes cluster
- **curl** or **wget**: Installed for downloading resources

## Installation

### 1. Create Your Backstage App

To create a new Backstage app, use the following command:

```bash
npx @backstage/create-app@latest
```

This will create a new directory with the Backstage app. Navigate to your app's directory:

```bash
cd my-backstage-app
```

### 2. Run the Backstage App in Standalone Mode

To start the app in standalone mode (suitable for development), use:

```bash
yarn dev
```
This will start both the frontend and backend in development mode. Open your browser and navigate to http://localhost:3000 to view your Backstage instance.

## High Availability (HA) Mode Deployment

### 3.1. Create a Kubernetes Namespace

Create a namespace for Backstage:

```bash
kubectl create namespace backstage
```

Alternatively, you can create a namespace using a YAML definition:

#### kubernetes/namespace.yaml
```bash
apiVersion: v1
kind: Namespace
metadata:
  name: backstage
```

Apply the namespace:

```bash
kubectl apply -f kubernetes/namespace.yaml
```

### 3.2. Set Up PostgreSQL Database

#### 3.2.1. Create PostgreSQL Secrets

Create a Kubernetes Secret for PostgreSQL credentials:

#### kubernetes/postgres-secrets.yaml
```bash
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secrets
  namespace: backstage
type: Opaque
data:
  POSTGRES_USER: YmFja3N0YWdl
  POSTGRES_PASSWORD: aHVudGVyMg==
```

Apply the secrets:

```bash
kubectl apply -f kubernetes/postgres-secrets.yaml
```

#### 3.2.2. Create a PostgreSQL Persistent Volume

Create a PersistentVolume and PersistentVolumeClaim:

#### kubernetes/postgres-storage.yaml
```bash
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-storage
  namespace: backstage
  labels:
    type: local
spec:
  storageClassName: manual
  capacity:
    storage: 2G
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: '/mnt/data'
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-storage-claim
  namespace: backstage
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2G
```
Apply the storage volume and claim:

```bash
kubectl apply -f kubernetes/postgres-storage.yaml
```

#### 3.2.3. Create PostgreSQL Deployment

Create a PostgreSQL deployment:

#### kubernetes/postgres.yaml
```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: backstage
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:13.2-alpine
          imagePullPolicy: 'IfNotPresent'
          ports:
            - containerPort: 5432
          envFrom:
            - secretRef:
                name: postgres-secrets
          volumeMounts:
            - mountPath: /var/lib/postgresql/data
              name: postgresdb
              subPath: data
      volumes:
        - name: postgresdb
          persistentVolumeClaim:
            claimName: postgres-storage-claim
```
Apply the PostgreSQL deployment:

```bash
kubectl apply -f kubernetes/postgres.yaml
```

#### 3.2.4. Create PostgreSQL Service

Create a Kubernetes Service to expose PostgreSQL:

#### kubernetes/postgres-service.yaml
```bash
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: backstage
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
```
Apply the service:

```bash
kubectl apply -f kubernetes/postgres-service.yaml
```

### 3.3. Deploy Backstage

#### 3.3.1. Create Backstage Secrets

Create Kubernetes secrets for Backstage:

#### kubernetes/backstage-secrets.yaml
```bash
apiVersion: v1
kind: Secret
metadata:
  name: backstage-secrets
  namespace: backstage
type: Opaque
data:
  GITHUB_TOKEN: {your_github_token}
```
Apply the secrets:

```bash
kubectl apply -f kubernetes/backstage-secrets.yaml
```

#### 3.3.2. Create Backstage Deployment

Create a Backstage deployment:

#### kubernetes/backstage.yaml
```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backstage
  namespace: backstage
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backstage
  template:
    metadata:
      labels:
        app: backstage
    spec:
      containers:
        - name: backstage
          image: {your_backstage_docker_image}
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 7007
          envFrom:
            - secretRef:
                name: postgres-secrets
            - secretRef:
                name: backstage-secrets
```
Apply the Backstage deployment:

```bash
kubectl apply -f kubernetes/backstage.yaml
```

#### 3.3.3. Create Backstage Service

Create a Kubernetes Service to expose Backstage:

#### kubernetes/backstage-service.yaml
```bash
apiVersion: v1
kind: Service
metadata:
  name: backstage
  namespace: backstage
spec:
  selector:
    app: backstage
  ports:
    - name: http
      port: 80
      targetPort: http
```
Apply the service:

```bash
kubectl apply -f kubernetes/backstage-service.yaml
```
#### 3.3.4. Create ALB Resource

#### 3.3.5. Create ExternalDNS Resource