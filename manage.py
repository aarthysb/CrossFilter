from flask_script import Manager, Shell, Server
from flask_assets import ManageAssets
from crossfiltertest import app, assets_env

manager = Manager(app)
manager.add_command("runserver", Server())
manager.add_command("assets", ManageAssets(assets_env))
manager.add_command("shell", Shell())

if __name__ == "__main__":
    manager.run()

