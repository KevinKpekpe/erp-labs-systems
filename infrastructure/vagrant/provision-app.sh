#!/bin/bash

# Script de provisionnement simplifié pour app-server
# ERP Labs Systems - Version DevOps Junior
# Basé sur l'article PhoenixNAP : https://phoenixnap.com/kb/install-minikube-on-ubuntu

set -e

echo "🚀 Provisionnement de 'app-server' - Version Simplifiée"
echo "======================================================"

# --- ÉTAPE 1 : Configuration système de base ---
# ------------------------------------------------------------------------------
echo "🔧 Configuration système de base..."

# Mise à jour du système
sudo apt-get update
sudo apt-get upgrade -y

# Configuration du firewall simplifié
echo "🔒 Configuration du firewall..."
sudo ufw allow ssh
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 8081
sudo ufw allow 3001
sudo ufw --force enable
echo "✅ Firewall configuré."

# --- ÉTAPE 2 : Installation des dépendances ---
# ------------------------------------------------------------------------------
echo "🔧 Installation des dépendances système..."
sudo apt-get install -y \
    curl \
    wget \
    git \
    htop \
    tree \
    jq \
    software-properties-common \
    apt-transport-https

# --- ÉTAPE 3 : Installation de Docker ---
# ------------------------------------------------------------------------------
echo "🐳 Installation de Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker vagrant
rm get-docker.sh

# Installation de Docker Compose
echo "🐳 Installation de Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# --- ÉTAPE 4 : Installation de Minikube (selon PhoenixNAP) ---
# ------------------------------------------------------------------------------
echo "☸️ Installation de Minikube selon PhoenixNAP..."

# Étape 1 : Télécharger le binaire Minikube
echo "📥 Téléchargement du binaire Minikube..."
curl -O https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Étape 2 : Copier dans /usr/local/bin
echo "📁 Installation du binaire Minikube..."
sudo cp minikube-linux-amd64 /usr/local/bin/minikube

# Étape 3 : Donner les permissions d'exécution
echo "🔐 Configuration des permissions..."
sudo chmod 755 /usr/local/bin/minikube

# Vérification de l'installation
echo "✅ Vérification de l'installation Minikube..."
minikube version

# --- ÉTAPE 5 : Installation de kubectl ---
# ------------------------------------------------------------------------------
echo "🔧 Installation de kubectl..."

# Méthode 1 : Via snap (plus simple)
echo "📦 Installation via snap..."
sudo snap install kubectl --classic

# Méthode 2 : Via binaire direct (alternative)
echo "📥 Installation via binaire direct..."
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl

# Vérification de kubectl
echo "✅ Vérification de kubectl..."
kubectl version --client

# --- ÉTAPE 6 : Installation de Helm ---
# ------------------------------------------------------------------------------
echo "🛠️ Installation de Helm..."
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install -y helm

# --- ÉTAPE 7 : Configuration de l'environnement ---
# ------------------------------------------------------------------------------
echo "🔧 Configuration de l'environnement shell..."
BASHRC_CONTENT=$(cat <<'EOF'

# Configuration pour ERP Labs Systems
export PATH=$PATH:/usr/local/bin

# Alias utiles
alias k='kubectl'
alias d='docker'
alias dc='docker-compose'
alias m='minikube'

# Fonction pour démarrer Minikube (selon PhoenixNAP)
start-k8s() {
    echo "Démarrage de Minikube..."
    # Utiliser le driver docker par défaut (plus stable)
    minikube start --driver=docker
    if [ $? -eq 0 ]; then
        echo "Minikube démarré avec succès !"
        kubectl get nodes
    else
        echo "Erreur lors du démarrage de Minikube"
        echo "Tentative avec le driver none..."
        minikube start --driver=none
        if [ $? -eq 0 ]; then
            echo "Minikube démarré avec succès (driver none) !"
            kubectl get nodes
        else
            echo "Échec du démarrage de Minikube"
            echo "Vérifiez l'espace disque et la mémoire disponible"
        fi
    fi
}

# Fonction pour arrêter Minikube
stop-k8s() {
    echo "Arrêt de Minikube..."
    minikube stop
    echo "Minikube arrêté !"
}

# Fonction pour voir le dashboard
dashboard() {
    echo "Ouverture du dashboard..."
    minikube dashboard
}

# Fonction pour supprimer le cluster
delete-k8s() {
    echo "Suppression du cluster Minikube..."
    minikube delete
    echo "Cluster supprimé !"
}
EOF
)
grep -qF "# Configuration pour ERP Labs Systems" /home/vagrant/.bashrc || echo "$BASHRC_CONTENT" >> /home/vagrant/.bashrc
sudo chown vagrant:vagrant /home/vagrant/.bashrc

# --- ÉTAPE 8 : Finalisation ---
# ------------------------------------------------------------------------------
echo "📁 Création des répertoires de travail..."
mkdir -p /home/vagrant/erp-project
mkdir -p /home/vagrant/kubernetes-manifests

echo "✅ Provisionnement terminé avec succès !"
echo ""
echo "🎯 Prochaines étapes :"
echo "1. Connectez-vous : vagrant ssh app-server"
echo "2. Démarrez Minikube : start-k8s"
echo "3. Déployez l'application : kubectl apply -f kubernetes-manifests/"
echo ""
echo "📝 Commandes utiles :"
echo "  - start-k8s : Démarrer Kubernetes"
echo "  - stop-k8s : Arrêter Kubernetes"
echo "  - dashboard : Ouvrir le dashboard"
echo "  - delete-k8s : Supprimer le cluster"
echo "  - k get pods : Voir les pods"
echo "  - dc up : Démarrer avec Docker Compose"
echo ""
echo "📚 Référence : https://phoenixnap.com/kb/install-minikube-on-ubuntu"
