# backend

Backend api service to query database, call face recognision API and serve requests from frontend

# Step to run

1. Install `docker` and `docker-compose`
2. run `docker-compose up`

# Changes to setup.sql
1. run `docker-compose down -v`
2. run `docker-compose up`
3. run `docker ps`
4. run `docker exec -it (first three characters of container id for mysql) bash` 
5. run `mysql -u root -p`
6. input `password`
7. run `show databases;`
8. run `use ase;`
9. run `show tables;`
10. run `select * from class;` to see the class table
