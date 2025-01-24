URL BACK :
http://localhost:3000/

URL BASE DE DONNEE :
http://localhost:5050/login?next=/

PERMISSION DOCKER POUR PGDATA :
sudo chown -R $USER:$USER ./pgdata
( Cela donne à l'utilisateur actuel la propriété du dossier pgdata. )

sudo usermod -aG docker $USER
( Puis, déconnectez-vous et reconnectez-vous pour appliquer les changements. )

CREATION ET CONNEXION PGDATA :
EMAIL : myadmin@example.com
MOT DE PASSE : mysecretpgadminpassword

NOM SERVEUR : postgres
NOM D'HOTE/ADRESSE : db
PORT : 5432
BASE DE DONNEE DE MAINTENANCE : postgres
IDENTIFIANT : postgres
MOT DE PASSE : mysecretpassword
