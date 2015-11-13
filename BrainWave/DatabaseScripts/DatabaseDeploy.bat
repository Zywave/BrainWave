echo on
sqllocaldb create BrainwaveDb -s
sqllocaldb share BrainwaveDb BrainwaveDb
sqlcmd -S127.0.0.1\(localdb)\BrainwaveDb,1433 -iDatabaseMigrationScript.sql
sqlcmd -S127.0.0.1\(localdb)\BrainwaveDb,1433 -Q"create login [IIS APPPOOL\ASP.NET v4.0] from windows;exec sp_addsrvrolemember N'IIS APPPOOL\ASP.NET v4.0', sysadmin"
