#!/bin/bash

# Script de provisionnement pour la VM Ansible Controller
# Installation d'Ansible et des outils nécessaires

set -e

echo "🚀 Démarrage du provisionnement Ansible Controller..."

# Mise à jour du système
echo "📦 Mise à jour du système..."
sudo apt-get update
sudo apt-get upgrade -y

# Installation des dépendances
echo "🔧 Installation des dépendances..."
sudo apt-get install -y \
    software-properties-common \
    python3 \
    python3-pip \
    python3-venv \
    git \
    curl \
    wget \
    unzip \
    sshpass \
    rsync

# Installation d'Ansible
echo "🤖 Installation d'Ansible..."
sudo apt-get install -y ansible

# Installation des collections Ansible nécessaires
echo "📚 Installation des collections Ansible..."
ansible-galaxy collection install kubernetes.core
ansible-galaxy collection install community.docker
ansible-galaxy collection install ansible.posix

# Installation de kubectl pour la gestion Kubernetes
echo "☸️ Installation de kubectl..."
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
rm kubectl

# Configuration SSH pour l'utilisateur vagrant
echo "🔑 Configuration SSH..."
mkdir -p /home/vagrant/.ssh
chmod 700 /home/vagrant/.ssh

# Génération de clé SSH si elle n'existe pas
if [ ! -f /home/vagrant/.ssh/id_rsa ]; then
    ssh-keygen -t rsa -b 4096 -f /home/vagrant/.ssh/id_rsa -N ""
    cat /home/vagrant/.ssh/id_rsa.pub >> /home/vagrant/.ssh/authorized_keys
fi

chown -R vagrant:vagrant /home/vagrant/.ssh
chmod 600 /home/vagrant/.ssh/id_rsa
chmod 644 /home/vagrant/.ssh/id_rsa.pub
chmod 644 /home/vagrant/.ssh/authorized_keys

# Configuration Ansible
echo "⚙️ Configuration Ansible..."
sudo mkdir -p /etc/ansible
sudo tee /etc/ansible/ansible.cfg > /dev/null <<EOF
[defaults]
host_key_checking = False
inventory = /home/vagrant/ansible/inventory.ini
remote_user = vagrant
private_key_file = /home/vagrant/.ssh/id_rsa
timeout = 30
gathering = smart
fact_caching = memory
stdout_callback = yaml

[ssh_connection]
ssh_args = -o ControlMaster=auto -o ControlPersist=60s -o UserKnownHostsFile=/dev/null -o IdentitiesOnly=yes
pipelining = True
EOF

# Installation d'outils de monitoring
echo "📊 Installation d'outils de monitoring..."
sudo apt-get install -y htop iotop nethogs

# Configuration de l'environnement pour vagrant
echo "🔧 Configuration de l'environnement..."
cat >> /home/vagrant/.bashrc <<EOF

# Configuration ERP Labs Systems
export ANSIBLE_CONFIG=/etc/ansible/ansible.cfg
export KUBECONFIG=/home/vagrant/.kube/config

# Alias utiles
alias ansible-playbook='ansible-playbook -i /home/vagrant/ansible/inventory.ini'
alias k8s='microk8s kubectl'
alias k8s-status='microk8s status'

# Fonction pour déployer l'application
deploy-erp() {
    cd /home/vagrant/ansible
    ansible-playbook playbook-deploy.yml --limit kubernetes_clusters
}

# Fonction pour vérifier le statut
status-erp() {
    echo "=== Statut MicroK8s ==="
    microk8s status
    echo "=== Pods ERP ==="
    microk8s kubectl get pods -n erp-labs-systems
    echo "=== Services ERP ==="
    microk8s kubectl get svc -n erp-labs-systems
}
EOF

# Changement de propriétaire
chown vagrant:vagrant /home/vagrant/.bashrc

# Création du répertoire de travail
mkdir -p /home/vagrant/erp-workspace
chown vagrant:vagrant /home/vagrant/erp-workspace

echo "✅ Provisionnement Ansible Controller terminé !"
echo ""
echo "🔧 Commandes utiles :"
echo "  - Vérifier Ansible: ansible --version"
echo "  - Tester la connexion: ansible all -m ping"
echo "  - Déployer l'application: deploy-erp"
echo "  - Vérifier le statut: status-erp"
echo ""
echo "📁 Répertoires importants :"
echo "  - Ansible: /home/vagrant/ansible"
echo "  - Workspace: /home/vagrant/erp-workspace"
echo "" 