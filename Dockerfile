# Utiliser l'image officielle Nginx
FROM nginx:latest

# Supprimer la config par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier ta config Nginx custom (voir ci-dessous)
COPY nginx.conf /etc/nginx/conf.d/
RUN rm -rf /usr/share/nginx/html/*
# Copier les fichiers buildés Angular (le contenu du dossier dist/nom-projet)
COPY dist/gestionimmo-ui/browser /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html
# Exposer le port 80
EXPOSE 80

# Démarrer Nginx en mode foreground
CMD ["nginx", "-g", "daemon off;"]