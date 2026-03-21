Cahier des charges : Système de gestion des courriers à l’INSEED 

Par KENKOU Dave




1\.	Objectifs du projet :



&nbsp;développer une application web qui permet de gérer les courriers entrants et sortants 



•	Digitaliser la gestion des courriers entrants et sortants au niveau du secrétariat générale.

&nbsp;

•	Assurer la traçabilité complète du traitement des courriers jusqu’à l’intéressé. 



•	Réduire les délais de traitement et améliorer la coordination entre Direction et services. 



•	Offrir un tableau de bord dynamique pour le suivi en temps réel. • 	

•	Assurer l’archivage et faciliter la recherche. 



•	Générer des statistiques pour le pilotage administratif. 



2\.	Règles de gestion 



•	Chaque courrier entrant reçoit un numéro unique inscrit sur une fiche de transmission. 



•	La numérotation est annuelle : elle recommence à 1 chaque année pour chaque courrier entrant et sortant. 



•	Les courriers sortants ont une numérotation distincte du courrier entrant. 



•	Le courrier est scanné dès sa réception au secrétariat. 



•	Le courrier est transmis au Directeur Général (DG) qui peut l’affecte à une ou plusieurs directions (maximum 10). 



•	Après traitement, la direction renvoie le dossier au DG pour validation. 



•	Le DG transmet ensuite au secrétariat du DG, qui prépare et envoie la réponse par mail au coursier sortant. 



•	Le coursier reçoit une décharge confirmant la réception. 



•	Les dossiers classés sont ceux ne nécessitant pas de réponse.

&nbsp;

•	Le système doit permettre de suivre chaque courrier jusqu’à sa destination finale.

&nbsp;

3\.	Fonctionnalités attendues 



A.	Gestion des courriers entrants 



•	Attribution automatique du numéro (format : ENT-AAAA-NNNN)

&nbsp;

•	Enregistrement du courrier (type, expéditeur(nom de la structure, nomResponsable de la structure, adresse email et géographique de la structure, tél), objet, date, service destinataire) 



•	Scan et archivage  numérique 



•	Génération de la fiche de transmission

&nbsp;

•	Transmission au DG pour affectation 

•	Suivi du traitement par direction 

•	Retour au DG pour validation 

•	Transmission au secrétariat du DG 

•	Envoi de la réponse au coursier avec décharge 



B.	Gestion des courriers sortants 



•	Elaboration du courrier (type, destinataire(nom de la structure, nomResponsable de la structure, adresse email et géographique de la structure, tél), objet, service émetteur) 

•	Attribution du numéro (format : SOR-AAAA-NNNN) 

•	Archivage et suivi(date\_retour)

•	Génération de la réponse et transmission (pour des courriers d’accuser de réception)



C.	Tableau de bord dynamique 



•	Statistiques en temps réel : 



o	Nombre total de courriers reçus

o	Nombre total de courriers envoyés

o	Répartition par type de courriers (demande, facture, etc.) 

o	Répartition par type de courriers selon la direction ou service



•	Statut des courriers : 

Dossiers non traités 

Dossiers en attente 

Dossiers traités 

Dossiers classés (sans réponse requise) 



•	Lien mail, whatsapp ou autres moyens de communication vers la destinataire finale  :  

o	Historique complet du parcours du courrier

o	Dernier service ayant traité le dossier 

o	Date et mode de réponse 



D.	Recherche et consultation 



•	Moteur de recherche multicritères (référence, date, objet, service, type) 

•	Filtres par période, statut, direction, structure expéditeur/destinataire

•	Consultation des courriers archivés

&nbsp;

E.	Gestion des utilisateurs 



•	Authentification par rôle (administrateur, DG, direction, secrétariat, Division, services) 

•	Journal des actions et connexions 

•	Gestion des droits d’accès 



4\.	Contraintes techniques 



•	Application web responsive (PC, tablette) 

•	Technologies recommandées : PHP/Angular, MySQL/PostgreSQL 

•	Hébergement sécurisé (serveur interne ou cloud) 

•	Sauvegarde automatique et restauration 

•	Intégration SMTP pour envoi de mails 

•	Interface intuitive pour agents non techniques 



