from flask import Flask, redirect, url_for, make_response, json, jsonify, request, render_template, session
# from flask_session import Session
# for react calling
from flask_cors import CORS, cross_origin
# for sending mail
from flask_mail import Mail, Message
from flask_pymongo import PyMongo
from bson import DBRef
# hash pass generator
from flask_bcrypt import Bcrypt
# for dumping value in resposne
from bson.json_util import dumps
import json
# for returning objectID
from bson.objectid import ObjectId
# for wraping
from functools import wraps
from functools import reduce
# for token
import jwt
# token expired time
import datetime
# generate random number
from random import randint
import pandas as pd
import os
import shutil
from werkzeug.utils import secure_filename
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
import cloudinary
import cloudinary.uploader
# from flask_email_verifier import Client
# from flask_email_verifier import exceptions
UPLOAD_FOLDER = os.getcwd()
# UPLOAD_FOLDER = 'https://api.agriculturist.org'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])


# initialize the app
app = Flask(__name__)

# random secrect key initialization
app.secret_key = "thisisthesecretkey"
# db config
app.config['MONGO_URI'] = "mongodb://localhost:27017/userReg"
#app.config['MONGO_URI'] = "mongodb://root:iritadb2021@127.0.0.1:27020/userReg?authSource=admin"
# app.config['MONGO_URI'] = "mongodb://admin:iritadb2021@localhost:27020/userReg?authSource=admin"
# configuration for flask-mail
app.config["MAIL_SERVER"] = 'webmail.iritatech.com'
app.config["MAIL_PORT"] = 465
app.config["MAIL_USERNAME"] = 'admin@iritatech.com'
# app.config['MAIL_PASSWORD'] = 'X5Y[qN!GM3Yu'
app.config['MAIL_PASSWORD'] = 'kV32_9ZZ}B2s'


app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['UPLOAD_FOLDER'] = os.getcwd()

# SESSION_TYPE = 'filesystem'
# app.config.from_object(__name__)
# Session(app)
CORS(app, supports_credentials=True)
mail = Mail(app)
# verifier = EmailVerifier(app)
# EMAIL_VERIFIER_KEY = 'at_4WGDL75Kbnd4H7dLhDHOKZU6E0xY5'

# connects to the mongoDB server
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
safeSerializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
# -----------login Start-------------


def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = ''
        # print(request.headers)
        # token = request.headers['X-Auth-Token']
        # print(token)
        if 'Authorization' in request.headers:
            token = request.headers['Authorization']
            ExBr = token.split(" ")
            # print("Token Testing: "+ExBr[1])
            token = ExBr[1]
        if not token:
            message = {
                'data': "null",
                'result': {'isError': 'true', 'message': 'A valid token is missing', 'status': 404, }
            }
            return jsonify(message)
        try:
            data = jwt.decode(
                token, app.config['SECRET_KEY'], algorithms=["HS256"])
            # print(data)
            session['user'] = data['user']
        except:
            message = {
                'data': "null",
                'result': {'isError': 'true', 'message': 'Token is invalid', 'status': 404, }
            }
            return jsonify(message)
        return f(*args, **kwargs)
    return decorator


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    return app.send_static_file('index.html')

# for unprotected users and dont have any token


@app.route('/unprotected')
def unprotected():
    return jsonify({'message': 'Anyone can view this'})


# for valid users with token


@app.route('/protected')
@token_required
def protected():
    print('hello')
    return jsonify({'message': 'Available with valid tokens'})

# Email Verification


# @app.route('/email_test', methods=['POST'])
# @cross_origin(supports_credentials=True)
# def email_test():
#     _json = request.json
#     print(_json)
#     # _name = _json['name']
#     _email = _json['email']
#     # Retrieve an info for the given email address
#     email_address_info = verifier.verify(_email)
#     print(email_address_info)
#     if email_address_info is not None:
#         data = dumps(loads(email_address_info.json_string), indent=4)
#         resp = make_response(data, 200)
#         resp.headers['Content-Type'] = 'application/json'
#     else:
#         resp = 'Not found'
#     return resp


@app.route('/login', methods=['GET', 'POST'])
@cross_origin(supports_credentials=True)
def login():
    try:
        _json = request.json
        # print(_json)
        # _name = _json['name']
        _email = _json['email']
        _password = _json['password']
        # if email & name is matched
        response = mongo.db.userReg.find_one({'email': _email})
        if response:
            if response['emailconfirm']:
                if bcrypt.check_password_hash(response['password'], _password):
                    # generating token and set token time 60 minutes
                    token = jwt.encode({'user': response['email'], 'exp': datetime.datetime.utcnow(
                    ) + datetime.timedelta(minutes=1060)}, app.config['SECRET_KEY'])
                    # usermail
                    # print(token)
                    # returning the token
                    message = {
                        'data': {'token': token},
                        'result': {'isError': 'false', 'message': 'Login Successful', 'status': 200, }
                    }
                    return jsonify(message)
                else:
                    message = {
                        'data': 'null',
                        'result': {'isError': 'true', 'message': 'password is invalid', 'status': 401, }
                    }
                    return jsonify(message)
            else:
                message = {
                    'data': 'null',
                    'result': {'isError': 'true', 'message': 'User Account is not activated', 'status': 401, }
                }
                return jsonify(message)
        else:
            message = {
                'data': 'null', 'result': {'isError': 'true', 'message': 'Username or password is invalid', 'status': 401, }
            }
            return jsonify(message)
    except Exception as e:
        print(e)
        return internal_error()
    # return make_response(jsonify(message), 401, {'WWW-Authenticate': 'Basic realm="Login Required" '})

# OTP varify and generate token


@app.route('/otp_verify', methods=['POST'])
def otp_verify():
    _json = request.get_json()
    _user_email = _json['email']
    _user_otp = _json['otp']
    f = 0
    for post in mongo.db.userOtp.find():
        if post['email'] == _user_email and post['otp'] == _user_otp:
            mongo.db.userOtp.delete_one(post)
            f = 1
            break
    if(f == 1):
        response = {'email': _user_email}
        # generating token and set token time 60 minutes
        token = jwt.encode({'user': response['email'], 'exp': datetime.datetime.utcnow(
        ) + datetime.timedelta(minutes=60)}, app.config['SECRET_KEY'])
        # usermail
        session['user'] = _user_email

        # returning the token
        message = {
            'data': {'token': token.decode('UTF-8')},
            'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
        }
        return jsonify(message)
    else:
        message = {
            'data': "null",
            'result': {'isError': 'true', 'message': 'Invalid', 'status': 404, }
        }
        return jsonify(message)
# -----------login End---------------
# -----------Registration Start------
# adding user


@app.route('/add', methods=['POST'])
@cross_origin(supports_credentials=True)
def add_user():
    # _json = request.get_json()
    try:
        _json = request.form
        _firstname = _json['firstname']
        _middlename = _json['middlename']
        _lastname = _json['lastname']
        _name = _firstname.strip() + ' ' + _middlename.strip() + ' ' + _lastname.strip()
        _name = _name.strip()
        _user_category = _json['user_category']
        _student_type = _json['student_type']
        _job_type = _json['job_type']
        _specialization_type = _json['specialization_type']
        _email = _json['email']
        _phone = _json['phone']
        _address = _json['address']
        _country = _json['country']

        _referrer_name = _json['referrer_name']
        _referrer_email = _json['referrer_email']
        _emailconfirm = False
        # print(_referrer_email)
        _password = bcrypt.generate_password_hash(
            _json['password']).decode('utf-8')
        _passwordconfirm = bcrypt.generate_password_hash(
            _json['passwordconfirm']).decode('utf-8')
        existing_user = mongo.db.userReg.find_one({'email': _email})
        if(existing_user):
            message = {
                'data': "null",
                'result': {'isError': 'true', 'message': 'Email is already exists', 'status': 200, }
            }
            return jsonify(message)
        existing_referrer = mongo.db.userReg.find_one(
            {'email': _referrer_email})
        if(existing_referrer is None):
            message = {
                'data': "null",
                'result': {'isError': 'true', 'message': 'Referrer Email is invalid or not exist in our system', 'status': 200, }
            }
            return jsonify(message)
        cloudinary.config(cloud_name="daf1cgy1c", api_key="228197214629277",
                          api_secret="DferVvyNAJovYz-cOug7zIx6cR4")
        upload_result = None
        if 'file' in request.files:
            _file = request.files['file']
            if _file and allowed_file(_file.filename):
                # print(_file)
                _imagefilename = secure_filename(_file.filename)
                # print(filename)
                _filename = _imagefilename.split(".")[0]
                # app.logger.info('%s file_to_upload', _file)
                upload_result = cloudinary.uploader.upload(
                    _file, public_id=_filename)
                # app.logger.info(upload_result)
            else:
                message = {
                    'data': "null",
                    'result': {'isError': 'true', 'message': 'Allowed image types are -> png, jpg, jpeg, gif', 'status': 200, }
                }
                return jsonify(message)
        else:
            _imagefilename = 'user-profile.png'
        _image = _imagefilename
        if _name and _email and _password and request.method == 'POST' and (existing_user is None):
            # insert details and generate id
            # mongo.save_file(_file.filename, _file)
            _insertId = mongo.db.userReg.insert({'firstname': _firstname, 'middlename': _middlename, 'lastname': _lastname, 'name': _name,
                                                 'email': _email, 'password': _password,
                                                 'passwordconfirm': _passwordconfirm, 'user_category': _user_category,
                                                 'student_type': _student_type, 'job_type': _job_type,
                                                 'specialization_type': _specialization_type, 'address': _address, 'phone': _phone,
                                                 'country': _country, 'image': _image, 'referrer_name': _referrer_name,
                                                 'referrer_email': _referrer_email, 'emailconfirm': _emailconfirm,
                                                 'roles': [], 'groups': [], 'ts': [], 'friends': []})

            # mongo.db.upload.insert({'upload_file_name': _file.filename})
            # for json response
            # print(_insertId)
            token = safeSerializer.dumps(
                _referrer_email, salt='email-confirm')
            msg = Message(subject='Account Confirmation',
                          sender='admin@iritatech.com', recipients=[_referrer_email])
            link = url_for('confirm_email', token=token,
                           id=_insertId, _external=True)
            msg.body = """A user {} wants to create account using your reference.
            The user acivation link is {}""".format(_name, link)
            msgReply = mail.send(msg)
            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'Registration successfull, Mail has been sent to your referrer email. Tell your referrer to activate the link', 'status': 200, }
            }
            return jsonify(message)
        else:
            message = {
                'data': "null",
                'result': {'isError': 'true', 'message': 'User added unsuccessfull', 'status': 200, }
            }
            return jsonify(message)
    except:
        return internal_error()

# Confirm Email


@app.route('/confirm_account')
def confirm_account():
    return 'Successful'


@app.route('/confirm_email/<token>/<id>')
def confirm_email(token, id):
    try:
        _id = id
        # print('ID = ', _id)
        _email = safeSerializer.loads(
            token, salt='email-confirm', max_age=None)
        _emailconfirm = True
        _date = datetime.datetime.now()
        _update = mongo.db.userReg.update_one(
            {'_id': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)},
            {'$set': {'emailconfirm': _emailconfirm, 'date': _date}}
        )
        # print(_email)
        # print(_update)
        user = mongo.db.userReg.find_one({'_id': ObjectId(_id)})
        if(user):
            _userEmail = user['email']
            token = safeSerializer.dumps(_userEmail, salt='email-confirm')
            msg = Message(subject='Account Confirmation',
                          sender='admin@iritatech.com', recipients=[_userEmail])
            link = url_for('confirm_account', _external=True)
            msg.body = """Hello, Your account was successfully created in https://agriculturist.org
            Please click the link to login"""
            msgReply = mail.send(msg)
    except SignatureExpired:
        _id = id
        # print('Id in except = ', _id)
        existing_user = mongo.db.userReg.find_one({'_id': ObjectId(_id)})
        # print(existing_user)
        if(existing_user):
            mongo.db.userReg.delete_one({'_id': ObjectId(_id)})
        return '<h1>The session is expired! The user have to be registered again!</h1>'
    except:
        _id = id
        # print('Id in except = ', _id)
        existing_user = mongo.db.userReg.find_one({'_id': ObjectId(_id)})
        # print(existing_user)
        if(existing_user):
            mongo.db.userReg.delete_one({'_id': ObjectId(_id)})
        return '<h1>The account is not registered</h1>'
    return '<h1>The account is activated! Now the user can login.</h1>'

# Sending resetForm Link if Forget password


@app.route('/forgotPassword', methods=['POST'])
@cross_origin(supports_credentials=True)
def forgotPassword():
    try:
        _json = request.json
        # print(_json)
        _email = _json['email']
        response = mongo.db.userReg.find_one({'email': _email})
        # print(response)
        if response:
            token = safeSerializer.dumps(
                _email, salt='email-confirm')

            msg = Message(subject='Reset password',
                          sender='admin@iritatech.com', recipients=[_email])
            print(_json)
            link = url_for('confirm_account', token=token, _external=True)
            msg.body = """Click the link to reset password https://agriculturist.org/resetpassword"""
            # msg.body = """Click the link to reset password https://www.agriculturist.org/resetpassword"""

            mail.send(msg)
            # print(msg)
            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'A mail is sent to your Email, Click the link to reset password', 'status': 200, }
            }
            return jsonify(message)
        else:
            message = {
                'data': "null",
                'result': {'isError': 'true', 'message': 'Email does not exist, please enter registered email', 'status': 200, }
            }
            return jsonify(message)
    except Exception as e:
        print('Error ', e)
        return internal_error()

# Reset password


@app.route('/resetPassword', methods=['POST'])
@cross_origin(supports_credentials=True)
def resetPassword():
    try:
        _json = request.json
        _email = _json['email']
        response = mongo.db.userReg.find_one({'email': _email})
        _id = response['_id']
        _password = bcrypt.generate_password_hash(
            _json['password']).decode('utf-8')
        _passwordconfirm = bcrypt.generate_password_hash(
            _json['passwordconfirm']).decode('utf-8')
        _update = mongo.db.userReg.update_one(
            {'_id': ObjectId(_id)},
            {'$set': {'password': _password, 'passwordconfirm': _passwordconfirm}}
        )
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Reset password is successfull', 'status': 200, }
        }
        return jsonify(message)
    except Exception as e:
        print(e)
        return internal_error()


# Getting All user
@app.route('/getAllUser')
@cross_origin(supports_credentials=True)
def getAllUser():

    # mongo query for finding all value
    users = mongo.db.userReg.find({'emailconfirm': True})
    # print(user)
    if users:
        message = {
            'data': dumps(users),
            'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()

# showing all user


@app.route('/user')
@cross_origin(supports_credentials=True)
@token_required
def getUser():
    # data = jwt.decode(token, app.config['SECRET_KEY'])
    user = session['user']
    # print(user)
    # mongo query for finding all value
    user = mongo.db.userReg.find_one({'email': user})
    # print(user)
    if user:
        message = {
            'data': dumps(user),
            'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()

# showing specific user


@app.route('/searchUser', methods=['POST'])
@cross_origin(supports_credentials=True)
def searchUser():
    _json = request.json
    _searchUserData = _json['search_user']
    print(_searchUserData)
    # mongo query for finding all value
    _searchUser = mongo.db.userReg.find_one({'email': _searchUserData})
    if _searchUser:
        message = {
            'data': dumps(_searchUser),
            'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
        }
        return jsonify(message)
    _searchUser = mongo.db.userReg.find_one({'name': _searchUserData})
    if _searchUser:
        print(_searchUser)
        message = {
            'data': dumps(_searchUser),
            'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
        }
        return jsonify(message)
    return not_found()


@app.route('/user/<id>')
@cross_origin(supports_credentials=True)
@token_required
def user(id):
    # mongo query for finding specific id
    user = mongo.db.userReg.find_one({'_id': ObjectId(id)})
    message = {
        'data': {'user': dumps(user)},
        'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
    }
    return jsonify(message)


# Showing search user


# delete specific user

@app.route('/delete_ac/<id>', methods=['DELETE'])
@cross_origin(supports_credentials=True)
@token_required
def delete_user(id):
    existing_user = mongo.db.userReg.find_one({'_id': ObjectId(id)})
    if existing_user and request.method == 'DELETE':
        # mongo query for pull specific comment from posts
        mongo.db.posts.update_many(
            {}, {'$pull': {'comments': {'user.userId': ObjectId(id)}}})
        # Delete all posts for this user
        mongo.db.posts.delete_many({'user.userId': ObjectId(id)})
        # Delete all files for this user
        mongo.db.upload.delete_many({'user.userId': ObjectId(id)})
        # mongo query for deleting specific id
        mongo.db.userReg.delete_one({'_id': ObjectId(id)})
        # for json response
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'User deleted successfully', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()

# update user info


@ app.route('/update/<id>', methods=['PUT'])
@ cross_origin(supports_credentials=True)
@ token_required
def update_user(id):
    try:
        _id = id
        # print(_id)
        _json = request.form

        cloudinary.config(cloud_name="daf1cgy1c", api_key="228197214629277",
                          api_secret="DferVvyNAJovYz-cOug7zIx6cR4")
        upload_result = None
        if 'file' in request.files:
            _file = request.files['file']
            print(_file)

            if _file and allowed_file(_file.filename):
                print(_file.filename)
                _imagefilename = secure_filename(_file.filename)
                # print(filename)
                _filename = _imagefilename.split(".")[0]
                # app.logger.info('%s file_to_upload', _file)
                upload_result = cloudinary.uploader.upload(
                    _file, public_id=_filename)
                # app.logger.info(upload_result)
            else:
                message = {
                    'data': "null",
                    'result': {'isError': 'true', 'message': 'Allowed image types are -> png, jpg, jpeg, gif', 'status': 200, }
                }
                return jsonify(message)
        else:
            if _json['image'] == '':
                _imagefilename = 'user-profile.png'
            else:
                _imagefilename = _json['image']
        _firstname = _json['firstname']
        _middlename = _json['middlename']
        _lastname = _json['lastname']
        _name = _firstname.strip() + ' ' + _middlename.strip() + ' ' + _lastname.strip()
        _name = _name.strip()
        _user_category = _json['user_category']
        _student_type = _json['student_type']
        _job_type = _json['job_type']
        _specialization_type = _json['specialization_type']
        _email = _json['email']
        _phone = _json['phone']
        _address = _json['address']
        _country = _json['country']

        _image = _imagefilename

        _referrer_name = _json['referrer_name']
        _referrer_email = _json['referrer_email']
        _password = _json['password']
        _passwordconfirm = _json['passwordconfirm']
        if _name and _email and _id and request.method == 'PUT':
            # update mongoDb (query,set)
            mongo.db.userReg.update_one({'_id': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)},
                                        {'$set': {'firstname': _firstname, 'middlename': _middlename, 'lastname': _lastname,
                                                  'name': _name, 'email': _email, 'password': _password,
                                                  'passwordconfirm': _passwordconfirm, 'user_category': _user_category,
                                                  'student_type': _student_type, 'job_type': _job_type,
                                                  'specialization_type': _specialization_type, 'address': _address, 'phone': _phone,
                                                  'country': _country, 'image': _image, 'referrer_name': _referrer_name,
                                                  'referrer_email': _referrer_email,
                                                  'roles': [], 'groups': [], 'ts': [], 'friends': []}}
                                        )
            mongo.db.posts.update_many({'user.userId': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)},
                                       {'$set': {'user.image': _image}})
            mongo.db.posts.update_many(
                {'comments.user.userId': ObjectId(_id)},
                {'$set': {'comments.$.user.image': _image}}
            )
            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'User updated successfully', 'status': 200, }
            }
            return jsonify(message)
        else:
            message = {
                'data': "null",
                'result': {'isError': 'true', 'message': 'User not updated', 'status': 200, }
            }
            return jsonify(message)
    except Exception as e:
        print('Error in upload', e)
        return internal_error()


@ app.errorhandler(404)
def not_found(error=None):
    message = {
        'data': "null",
        'result': {'isError': 'true', 'message': 'Not Found', 'status': 404, }
    }
    return jsonify(message)


@ app.errorhandler(400)
def bad_request(error=None):
    message = {
        'data': "null",
        'result': {'isError': 'true', 'message': 'bad_request', 'status': 400, }
    }
    return jsonify(message)


@ app.errorhandler(500)
def internal_error(error=None):
    message = {
        'data': "null",
        'result': {'isError': 'true', 'message': 'INTERNAL SERVER ERROR', 'status': 500, }
    }
    return jsonify(message)
# -----------OTP generate-------------------
# -----------Registration End---------------

# -----------User Comment ------------------

# user post


@ app.route('/posts/<id>', methods=['POST'])
@ cross_origin(supports_credentials=True)
@ token_required
def create_post(id):
    # receiving from post
    _json = request.form
    _id = id
    _title = _json['title']
    _desc = _json['desc']
    # _category = _json['category']
    # _tags = _json['tags']
    _post_date = datetime.datetime.now()

    _filename = _json['filename']
    _fileID = '0123456789ab0123456789ab'

    if 'file' in request.files:
        _file = request.files['file']
        _filename = secure_filename(_file.filename)
        _filenameExt = _filename.split(".")[1]
        if _filenameExt in ALLOWED_EXTENSIONS and _id != 'null':
            print(_filenameExt)
            cloudinary.config(cloud_name="daf1cgy1c", api_key="228197214629277",
                              api_secret="DferVvyNAJovYz-cOug7zIx6cR4")
            _filenameWithoutExt = _filename.split(".")[0]
            cloudinary.uploader.upload(_file, public_id=_filenameWithoutExt)

    if _id != 'null':
        if _title and _desc:
            try:
                mongo.db.posts.update_one({'_id': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)},
                                          {'$set': {
                                              'title': _title, 'desc': _desc, 'filename': _filename, 'date': _post_date
                                          }
                })
                # print('PostId = ', postId)
                message = {
                    'data': 'null',
                    'result': {'isError': 'false', 'message': 'post updated successfull', 'status': 201, }
                }
                return jsonify(message)
            except:
                message = {
                    'data': 'null',
                    'result': {'isError': 'true', 'message': 'post updated Unsuccessfull', 'status': 201, }
                }
                return jsonify(message)
    else:
        try:
            # inserting new post
            user = mongo.db.userReg.find_one({'email': session['user']})
            _postID = 'null'
            if 'file' in request.files:
                _file = request.files['file']
                _file_mimetype = _file.content_type

                _filename = secure_filename(_file.filename)
                _filenameExt = _filename.split(".")[1]
                cloudinary.config(cloud_name="daf1cgy1c", api_key="228197214629277",
                                  api_secret="DferVvyNAJovYz-cOug7zIx6cR4")
                print(_filenameExt)
                if _filenameExt in ALLOWED_EXTENSIONS:
                    print(_filenameExt)
                    _filenameWithoutExt = _filename.split(".")[0]
                    print(_file)
                    _file = request.files['file']
                    if _file and allowed_file(_file.filename):
                        print(_filenameWithoutExt)
                        upload_result = cloudinary.uploader.upload(
                            request.files['file'], public_id=_filenameWithoutExt)

                mongo.save_file(_file.filename, request.files['file'])
                mongo.db.upload.insert_one(
                    {'title': _title, 'desc': _desc, 'filename': _filename,
                     'file_mimetype': _file_mimetype, 'postID': _postID, 'user': {'userId': user['_id']}, 'date': datetime.datetime.now()})
                _insertedRecord = mongo.db.upload.find(
                    {}).sort('date', -1).limit(1)
                for doc in _insertedRecord:
                    _newFile = doc
                    _fileID = _newFile['_id']
                    #print('DOC = ', _newFile['_id'])

            mongo.db.posts.insert_one({
                'title': _title,
                'desc': _desc,
                'filename': _filename,
                'fileID': ObjectId(_fileID),
                # 'category': _category,
                # 'tags': _tags,
                'user': {
                    'userId': user['_id'],
                    'status': user['name'],
                    'image': user['image']
                },
                'comments': [],
                'date': _post_date
            })

            if 'file' in request.files:
                _insertedPost = mongo.db.posts.find(
                    {}).sort('date', -1).limit(1)
                for doc in _insertedPost:
                    _newPost = doc
                    _postID = _newPost['_id']
                mongo.db.upload.update_one({'_id': ObjectId(_fileID)},
                                           {'$set': {'postID': _postID}})
            # print('PostId = ', insertData)
            message = {
                'data': 'null',
                'result': {'isError': 'false', 'message': 'post created successfull', 'status': 201, }
            }
            return jsonify(message)
        except Exception as e:
            print('Error in post adding', e)
            message = {
                'data': 'null',
                'result': {'isError': 'true', 'message': 'post created Unsuccessfull', 'status': 201, }
            }
            return jsonify(message)


@ app.route('/getAllPost', methods=['GET'])
@ cross_origin(supports_credentials=True)
@ token_required
def getAllpost():
    if request.method == 'GET':
        posts = mongo.db.posts.find().sort("date", -1)
        message = {
            'data': dumps(posts),
            'result': {'isError': 'false', 'message': 'Post Successfully return', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()


@ app.route('/get_post/<id>', methods=['GET'])
@ cross_origin(supports_credentials=True)
@ token_required
def get_post(id):
    # print(ObjectId(id))
    post = mongo.db.posts.find_one({'_id': ObjectId(id)})
    # user = mongo.db.userReg.find_one({'email': session['user']})
    # print(user['name'])
    # print(post)
    if post and request.method == 'GET':
        message = {
            'data': {'post': dumps(post)},
            'result': {'isError': 'false', 'message': 'Post return successfully', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()

# For Share post


@ app.route('/get_sharepost/<id>', methods=['GET'])
@ cross_origin(supports_credentials=True)
def get_sharepost(id):
    post = mongo.db.posts.find_one({'_id': ObjectId(id)})
    if post and request.method == 'GET':
        message = {
            'data': {'post': dumps(post)},
            'result': {'isError': 'false', 'message': 'Post return successfully', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()


@ app.route('/delete_post/<id>', methods=['DELETE'])
@ cross_origin(supports_credentials=True)
@ token_required
def delete_post(id):
    existing_post = mongo.db.posts.find_one({'_id': ObjectId(id)})
    if existing_post and request.method == 'DELETE':
        # mongo query for pull specific friend from other userRegs
        # mongo.db.posts.update_many(
        #     {}, {'$pull': {'friends': DBRef(collection="userReg", id=ObjectId(id))}})
        # # mongo query for deleting specific id
        post = mongo.db.posts.delete_one({'_id': ObjectId(id)})
        # for json response
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Post deleted successfully', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()


@ app.route('/delete_post', methods=['DELETE'])
@ cross_origin(supports_credentials=True)
@ token_required
def delete_posts():
    post = mongo.db.posts.delete_many({})
    # for json response
    message = {
        'data': "null",
        'result': {'isError': 'false', 'message': 'Post deleted successfully', 'status': 200, }
    }
    return jsonify(message)
# user comment


@ app.route('/comments/<id>', methods=['POST'])
@ cross_origin(supports_credentials=True)
@ token_required
def new_comment(id):
    try:
        # receving post id fro comment
        _post_id = id
        _json = request.json
        _cmnt_body = _json['cmntBody']
        user = mongo.db.userReg.find_one({'email': session['user']})
        print(session)
    except:
        message = {
            'data': "null",
            'result': {'isError': 'true', 'message': 'Server Error', 'status': 404, }
        }
        return jsonify(message)
    # post wise comment

    comment = {
        '_id': ObjectId(),
        'cmntBody': _cmnt_body,
        'user': {
            'userId': user['_id'],
            'name': user['name'],
            'image': user['image']
        },
        'date': datetime.datetime.now()
    }

    mongo.db.posts.update(
        {'_id': ObjectId(_post_id)},
        {
            '$push': {
                'comments': comment
            }
        }
    )
    message = {
        'data': dumps(comment),
        'result': {'isError': 'false', 'message': 'Comment added successfully', 'status': 201, }
    }
    return jsonify(message)

# Comment Updated


@ app.route('/update_comment/<pid>/<cid>', methods=['PUT'])
@ cross_origin(supports_credentials=True)
@ token_required
def update_comment(pid, cid):
    try:
        _json = request.json
        _cmnt_body = _json['cmntBody']
        print(_cmnt_body)
        cmnt = mongo.db.posts.update_one(
            {'_id': ObjectId(pid), 'comments._id': ObjectId(cid)},
            {'$set': {'comments.$.cmntBody': _cmnt_body}}
        )
        print(cmnt)
        # user = mongo.db.userReg.find_one({'email': session['user']})
        # print(_cmnt_body)
        # mongo.db.posts.update_one(
        #     {'_id': ObjectId(pid)},
        #     {'$pull': {'comments': {'_id': ObjectId(cid)}}}
        # )
        # comment = {
        #     '_id': ObjectId(),
        #     'cmntBody': _cmnt_body,
        #     'user': {
        #         'name': user['name'],
        #         'image': user['image']
        #     },
        #     'date': datetime.datetime.now()
        # }
        # mongo.db.posts.update(
        #     {'_id': ObjectId(pid)},
        #     {
        #         '$push': {
        #             'comments': comment
        #         }
        #     }
        # )
        message = {
            'data': 'null',
            'result': {'isError': 'false', 'message': 'Comment Updated successfully', 'status': 201, }
        }
        return jsonify(message)
        # if _cmnt_body and request.method == 'PUT':
        #     try:
        #         mongo.db.posts.comments.update_one({'_id': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)},
        #                                            {'$set': {
        #                                                'cmntBody': _cmnt_body,
        #                                                'date': datetime.datetime.now()
        #                                            }
        #         })
        #         message = {
        #             'data': 'null',
        #             'result': {'isError': 'false', 'message': 'comment updated successfull', 'status': 201, }
        #         }
        #         return jsonify(message)
        #     except:
        #         message = {
        #             'data': 'null',
        #             'result': {'isError': 'true', 'message': 'comment updated Unsuccessfull', 'status': 201, }
        #         }
        #         return jsonify(message)
    except:
        return 'error'

# delete comment


@ app.route('/delete_comment/<pid>/<cid>', methods=['DELETE'])
@ cross_origin(supports_credentials=True)
@ token_required
def delete_comment(pid, cid):
    try:
        # # mongo query for deleting specific id
        mongo.db.posts.update_one(
            {'_id': ObjectId(pid)},
            {'$pull': {'comments': {'_id': ObjectId(cid)}}}
        )
        # for json response
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Comment deleted successfully', 'status': 200, }
        }
        return jsonify(message)
    except:
        return not_found()
# comment reply


@ app.route('/comments/<pid>/<cid>', methods=['POST'])
def comment_reply(pid, cid):
    try:
        # receivng post & comment id for reply
        _post_id = pid
        _comment_id = cid
        _json = request.json
        _creply_body = _json['repBody']
        _user = session['user']
    except:
        return 'error'
    try:
        # adding reply against specific comment to database
        mongo.db.posts.update({'_id': ObjectId(_post_id),
                               'comments._id': ObjectId(_comment_id)},
                              {'$push': {'comments.$.child': {
                                  'repBody': _creply_body,
                                  'user': session['user'],
                                  'date': datetime.datetime.now()}}})
    except:
        return 'error'
    message = {
        'data': "null",
        'result': {'isError': 'false', 'message': 'Reply added successfully', 'status': 201, }
    }
    return jsonify(message)


# -----------User Comment end---------------

# -----------User Upload ------------------

# file upload with user name
@ app.route('/file_upload', methods=['POST'])
@ cross_origin(supports_credentials=True)
@ token_required
def file_upload():
    try:
        _json = request.form
        _title = _json['title']
        _desc = _json['desc']
        if 'file' in request.files:
            _file = request.files['file']
            _filename = _file.filename
            _file_mimetype = _file.content_type
            mongo.save_file(_file.filename, request.files['file'])

        # _filedata = _json['filedata']

        # print(_image)
        # print(_json)
        # cloudinary.config(cloud_name="daf1cgy1c", api_key="228197214629277",
        #                   api_secret="DferVvyNAJovYz-cOug7zIx6cR4")
        # upload_result = None
        # if _file:

        # _filenameUpload = _filename.split(".")[0]
        # app.logger.info('%s file_to_upload', _file)
        # upload_result = cloudinary.uploader.upload(
        #     request.files['file'], public_id=_filenameUpload)
        # app.logger.info(upload_result)
        user = mongo.db.userReg.find_one({'email': session['user']})
        # print(_file.filename)

    # # mongo.db.upload.insert(
    # #     {'upload_file_name': _file.filename})
        mongo.db.upload.insert_one(
            {'title': _title, 'desc': _desc, 'filename': _filename,
                'file_mimetype': _file_mimetype, 'user': {'userId': user['_id']}, 'date': datetime.datetime.now()})
        _insertedRecord = mongo.db.upload.find({}).sort('date', -1).limit(1)
        # mongo.db.upload.insert({'upload_file_name': _file.filename})

        for doc in _insertedRecord:
            _newFile = doc
            print('DOC = ', _newFile['_id'])
        message = {
            # 'data': dumps(_file.filename),
            'data': "null",
            'result': {'isError': 'false', 'message': 'File added', 'status': 200, }
        }
        return jsonify(message)
        # else:
        #     message = {
        #         'data': "null",
        #         'result': {'isError': 'true', 'message': 'File is not added', 'status': 200, }
        #     }
        #     return jsonify(message)
    except Exception as e:
        print('error = ', e)
        return internal_error()

# file upload with user name


@ app.route('/file_update/<id>', methods=['PUT'])
@ cross_origin(supports_credentials=True)
@ token_required
def file_update(id):
    try:
        _json = request.form
        _title = _json['title']
        _desc = _json['desc']
        _id = id
        if 'file' in request.files:
            _file = request.files['file']
            _filename = _file.filename
            _file_mimetype = _file.content_type
            mongo.save_file(_file.filename, request.files['file'])
        else:
            existing_file = mongo.db.upload.find_one({'_id': ObjectId(id)})
            _filename = existing_file['filename']
            _file_mimetype = existing_file['file_mimetype']

        mongo.db.upload.update_one({'_id': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)},
                                   {'$set': {'title': _title, 'desc': _desc,
                                             'filename': _filename, 'file_mimetype': _file_mimetype, 'date': datetime.datetime.now()}})
        # mongo.db.upload.insert({'upload_file_name': _file.filename})
        message = {
            # 'data': dumps(_file.filename),
            'data': "null",
            'result': {'isError': 'false', 'message': 'File Edited', 'status': 200, }
        }
        return jsonify(message)
        # else:
        #     message = {
        #         'data': "null",
        #         'result': {'isError': 'true', 'message': 'File is not added', 'status': 200, }
        #     }
        #     return jsonify(message)
    except Exception as e:
        print('error = ', e)
        return internal_error()

# sending file


@ app.route('/file/<filename>')
@ cross_origin(supports_credentials=True)
def file(filename):
    # response = make_response(send_file(filename, mimetype='image/png'))
    # response.headers['Content-Transfer-Encoding'] = 'base64'
    # return response
    return mongo.send_file(filename)


@ app.route('/fileDelete/<id>', methods=['DELETE'])
@ cross_origin(supports_credentials=True)
def fileDelete(id):
    try:
        print(id)
        existing_file = mongo.db.upload.find_one({'_id': ObjectId(id)})
        if existing_file and request.method == 'DELETE':
            # mongo query for pull specific friend from other userRegs
            # mongo.db.posts.update_many(
            #     {}, {'$pull': {'friends': DBRef(collection="userReg", id=ObjectId(id))}})
            # # mongo query for deleting specific id
            post = mongo.db.upload.delete_one({'_id': ObjectId(id)})
            # for json response
            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'File deleted successfully', 'status': 200, }
            }
            return jsonify(message)
        else:
            return not_found()
    except:
        return internal_error()


# @ app.route('/getSingleFile/<id>', methods=['GET'])
# @ cross_origin(supports_credentials=True)
# def getSingleFile(id):
#     try:
#         print(id)
#         existing_file = mongo.db.upload.find_one({'_id': ObjectId(id)})
#         if existing_file and request.method == 'GET':
#             message = {
#                 'data': dumps(existing_file),
#                 'result': {'isError': 'false', 'message': 'File return successfully', 'status': 200, }
#             }
#             return jsonify(message)
#         else:
#             return not_found()
#     except:
#         return internal_error()


@ app.route('/getAllFiles/<id>')
def getfile(id):
    try:
        _id = id
        if(_id == 'null'):
            files = mongo.db.upload.find().sort("date", -1)
        else:
            files = mongo.db.upload.find(
                {'user.userId': ObjectId(_id)}).sort("date", -1)
        message = {
            # 'data': dumps(_file.filename),
            'data': dumps(files),
            'result': {'isError': 'false', 'message': 'File data return', 'status': 200, }
        }
        return jsonify(message)
    except Exception as e:
        print(e)
        return internal_error()

# Add Advertisement


@ app.route('/upload_advertise', methods=['POST'])
@ cross_origin(supports_credentials=True)
@ token_required
def upload_advertise():
    try:
        # if 'file' not in request.files:
        #     message = {
        #         'data': "null",
        #         'result': {'isError': 'true', 'message': 'No File added in request', 'status': 200, }
        #     }
        #     return jsonify(message)
        # _advertiseFile = request.files['file']
        # if _advertiseFile.filename == '':
        #     message = {
        #         'data': "null",
        #         'result': {'isError': 'true', 'message': 'No image selected for uploading', 'status': 200, }
        #     }
        #     return jsonify(message)
        # if _advertiseFile and allowed_file(_advertiseFile.filename):
        #     _advfile_name = secure_filename(_advertiseFile.filename)
        #     _json = request.form
        #     _advertisement_type = _json['advertisement_type']
        #     _advfile_mimetype = _advertiseFile.content_type
        #     print('File location = ', os.getcwd())
        #     print('Location', os.path.dirname(os.path.abspath(__file__)))
        #     print('Loc = ', os.path.abspath(os.curdir))
        #     print('L = ', os.path.abspath("package.json"))
        #     target = os.path.join(UPLOAD_FOLDER, 'image/advertise')
        #     print('target = ', target)
        #     if not os.path.isdir(target):
        #         os.mkdir(target)
        #     destination = "/".join([target, _advfile_name])
        #     print('Path = ', destination)
        #     _advertiseFile.save(destination)
        #     # user = mongo.db.userReg.find_one({'email': session['user']})
        #     # mongo.db.advertiseUpload.insert(
        #     #     {'advertisement_type': _advertisement_type, 'filename': _advfile_name,
        #     #     'file_mimetype': _advfile_mimetype, 'user': session['user'], 'date': datetime.datetime.now()})
        #     message = {
        #         'data': "null",
        #         'result': {'isError': 'false', 'message': 'Avbertise successfully uploaded', 'status': 200, }
        #     }
        #     return jsonify(message)
        # else:
        #     message = {
        #         'data': "null",
        #         'result': {'isError': 'false', 'message': 'Allowed Image types are -> png, jpg, jpeg, gif', 'status': 200, }
        #     }
        #     return jsonify(message)
        _json = request.form
        _advertiseFile = request.files['file']
        _advertisement_type = _json['advertisement_type']
        _advfile_mimetype = _advertiseFile.content_type
        # _advfile_data = _json['image']
        # user = mongo.db.userReg.find_one({'email': session['user']})
        cloudinary.config(cloud_name="daf1cgy1c", api_key="228197214629277",
                          api_secret="DferVvyNAJovYz-cOug7zIx6cR4")
        upload_result = None
        if _advertiseFile and allowed_file(_advertiseFile.filename):
            _adv_name = secure_filename(_advertiseFile.filename)
            _advfile_name = _adv_name.split(".")[0]
            app.logger.info('%s file_to_upload', _advertiseFile)
            upload_result = cloudinary.uploader.upload(
                _advertiseFile, public_id=_advfile_name)
            app.logger.info(upload_result)
            mongo.db.advertiseUpload.insert(
                {'advertisement_type': _advertisement_type, 'filename': _adv_name,
                 'file_mimetype': _advfile_mimetype, 'user': session['user'], 'date': datetime.datetime.now()})
            # print(_advfile_name)
            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'Advertise successfully uploaded', 'status': 200, }
            }
            return jsonify(message)
        else:
            message = {
                'data': "null",
                'result': {'isError': 'true', 'message': 'Allowed Image types are -> png, jpg, jpeg, gif', 'status': 200, }
            }
            return jsonify(message)
    except Exception as e:
        print('Error = ', e)
        return internal_error()


@ app.route('/get_Advertise')
def get_Advertise():
    try:
        _advertise = mongo.db.advertiseUpload.find().sort("date", -1)
        # print(_advertise)
        message = {
            # 'data': dumps(_file.filename),
            'data': dumps(_advertise),
            'result': {'isError': 'false', 'message': 'Advertise data return', 'status': 200, }
        }
        return jsonify(message)
    except Exception as e:
        print(e)
        return internal_error()


@ app.route('/delete_advertise/<id>', methods=['DELETE'])
@ cross_origin(supports_credentials=True)
def delete_advertise(id):
    try:
        print(id)
        existing_adv = mongo.db.advertiseUpload.find_one({'_id': ObjectId(id)})
        if existing_adv and request.method == 'DELETE':
            # # mongo query for deleting specific id
            _adv = mongo.db.advertiseUpload.delete_one({'_id': ObjectId(id)})
            # for json response
            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'Advertise deleted successfully', 'status': 200, }
            }
            return jsonify(message)
        else:
            return not_found()
    except:
        return internal_error()
# for browser view(optional)


@ app.route('/user_upload/<username>')
def user_upload(username):
    user = mongo.db.upload.find_one_or_404({'username': username})
    return f'''
		<img src="{url_for('file', filename=user['upload_file_name'])}">
	'''
# -----------User upload end ---------------

# .......Role Based Start........................................................................................
# ______________________services____________________________
# Adding new services


@ app.route('/add_service', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
def add_service():
    _json = request.json
    _service_name = _json['service_name']
    _description = _json['description']
    # check service not exist
    existing_service = mongo.db.services.find_one({'name': _service_name})
    if _service_name and (existing_service is None) and request.method == 'POST':
        # insert new service
        mongo.db.services.insert(
            {'name': _service_name, 'description': _description})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'service_added_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# delete specific service


@ app.route('/delete_service/<id>', methods=['DELETE'])
def delete_service(id):
    existing_service = mongo.db.services.find_one({'_id': ObjectId(id)})
    if existing_service and request.method == 'DELETE':
        # mongo query for pull specific id from other collections
        mongo.db.roles.update_many(
            {}, {'$pull': {'services': DBRef(collection="services", id=ObjectId(id))}})
        mongo.db.groups.update_many(
            {}, {'$pull': {'services': DBRef(collection="services", id=ObjectId(id))}})
        # mongo query for deleting specific id
        service = mongo.db.services.delete_one({'_id': ObjectId(id)})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Service deleted successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# ______________________roles____________________________
# adding existing services to (new/existing)Role


@ app.route('/serviceto_role', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
def serviceto_role():
    _json = request.json
    _role_name = _json['role_name']
    _service_name = _json['service_name']
    existing_role = mongo.db.roles.find_one({'name': _role_name})
    existing_service = mongo.db.services.find_one({'name': _service_name, })
    # Add new service if not exist
    if (existing_service is None) and _role_name:
        mongo.db.services.insert({'name': _service_name, 'description': ''})
    # Add new role if not exist
    if (existing_role is None) and _service_name:
        mongo.db.roles.insert(
            {'name': _role_name, 'description': '', 'services': []})
    # check if Role already has the service
    if _role_name and existing_service:
        existing_serviced = mongo.db.roles.find_one({'name': _role_name, 'services': DBRef(
            collection="services", id=existing_service['_id'])})
    if existing_service and (existing_serviced is None) and request.method == 'POST':
        # update role with new existing service
        mongo.db.roles.update_one({'name': _role_name}, {'$push': {
                                  'services': DBRef(collection="services", id=existing_service['_id'])}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'service_to_role_added_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# remove targeted service from Role


@ app.route('/rm_service_fromrole', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
def rm_service_fromrole():
    _json = request.json
    _role_name = _json['role_name']
    _service_name = _json['service_name']
    existing_role = mongo.db.roles.find_one({'name': _role_name})
    existing_service = mongo.db.services.find_one({'name': _service_name, })
    # check if Role already has the service
    if _role_name and existing_service:
        existing_serviced = mongo.db.roles.find_one({'name': _role_name, 'services': DBRef(
            collection="services", id=existing_service['_id'])})
    if existing_service and (existing_serviced) and request.method == 'POST':
        # update role with pop the target existing service
        mongo.db.roles.update_one({'name': _role_name, 'services': DBRef(
            collection="services", id=existing_service['_id'])}, {'$pop': {'services': -1}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'rm_service_fromrole_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()
# delete specific role


@ app.route('/delete_role/<id>', methods=['DELETE'])
def delete_role(id):
    existing_role = mongo.db.roles.find_one({'_id': ObjectId(id)})
    if existing_role and request.method == 'DELETE':
        # mongo query for pull specific id from other collections
        mongo.db.groups.update_many(
            {}, {'$pull': {'roles': DBRef(collection="roles", id=ObjectId(id))}})
        mongo.db.userReg.update_many(
            {}, {'$pull': {'roles': DBRef(collection="roles", id=ObjectId(id))}})
        # mongo query for deleting specific id
        service = mongo.db.roles.delete_one({'_id': ObjectId(id)})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Role deleted successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# ______________________groups____________________________
# adding services to group


@ app.route('/serviceto_group', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
def serviceto_group():
    _json = request.json
    _service_name = _json['service_name']
    _group_name = _json['group_name']
    existing_group = mongo.db.groups.find_one({'name': _group_name})
    existing_service = mongo.db.services.find_one({'name': _service_name})
    # Add new service if not exist
    if (existing_service is None) and _group_name:
        mongo.db.services.insert({'name': _service_name, 'description': ''})
    # Add new group if not exist
    if _group_name and (existing_group is None):
        mongo.db.groups.insert(
            {'name': _group_name, 'description': '', 'roles': [], 'services': []})
    # check if Gropu already has the service
    if _group_name and existing_service:
        existing_serviced = mongo.db.groups.find_one({'name': _group_name, 'services': DBRef(
            collection="services", id=existing_service['_id'])})
    if existing_service and (existing_serviced is None) and request.method == 'POST':
        # update groups with new existing service
        mongo.db.groups.update_one({'name': _group_name}, {'$push': {
                                   'services': DBRef(collection="services", id=existing_service['_id'])}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'service_to_role_added_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# adding role to group


@ app.route('/roleto_group', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
def roleto_group():
    _json = request.json
    _group_name = _json['group_name']
    _role_name = _json['role_name']
    existing_group = mongo.db.groups.find_one({'name': _group_name})
    existing_role = mongo.db.roles.find_one({'name': _role_name})
    # Add new group if not exist
    if _group_name and (existing_group is None):
        mongo.db.groups.insert(
            {'name': _group_name, 'description': '', 'roles': [], 'services': []})
    # check if Group already has the Role
    if _group_name and existing_role:
        existing_roled = mongo.db.groups.find_one(
            {'name': _group_name, 'roles': DBRef(collection="roles", id=existing_role['_id'])})
    if existing_role and (existing_roled is None) and request.method == 'POST':
        # Update groups with new existing role
        mongo.db.groups.update_one({'name': _group_name}, {
                                   '$push': {'roles': DBRef(collection="roles", id=existing_role['_id'])}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'service_to_role_added_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# remove targeted service from group


@ app.route('/rm_service_fromgroup', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
def rm_service_fromgroup():
    _json = request.json
    _group_name = _json['group_name']
    _service_name = _json['service_name']
    existing_group = mongo.db.groups.find_one({'name': _group_name})
    existing_service = mongo.db.services.find_one({'name': _service_name, })
    # check if Role already has the service
    if _group_name and existing_service:
        existing_serviced = mongo.db.groups.find_one({'name': _group_name, 'services': DBRef(
            collection="services", id=existing_service['_id'])})
    if existing_service and (existing_serviced) and request.method == 'POST':
        # update role with pop the target existing service
        mongo.db.groups.update_one({'name': _group_name, 'services': DBRef(
            collection="services", id=existing_service['_id'])}, {'$pop': {'services': -1}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'rm_service_fromgroup_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# remove targeted role from group


@ app.route('/rm_role_fromgroup', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
def rm_role_fromgroup():
    _json = request.json
    _group_name = _json['group_name']
    _role_name = _json['role_name']
    existing_group = mongo.db.groups.find_one({'name': _group_name})
    existing_role = mongo.db.roles.find_one({'name': _role_name, })
    # check if Role already has the service
    if _group_name and existing_role:
        existing_roled = mongo.db.groups.find_one(
            {'name': _group_name, 'roles': DBRef(collection="roles", id=existing_role['_id'])})
    if existing_role and (existing_roled) and request.method == 'POST':
        # update role with pop the target existing role
        mongo.db.groups.update_one({'name': _group_name, 'roles': DBRef(
            collection="roles", id=existing_role['_id'])}, {'$pop': {'roles': -1}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'rm_role_fromgroup_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# delete specific group


@ app.route('/delete_group/<id>', methods=['DELETE'])
def delete_group(id):
    existing_group = mongo.db.groups.find_one({'_id': ObjectId(id)})
    if existing_group and request.method == 'DELETE':
        # mongo query for pull specific id from other collections
        mongo.db.userReg.update_many(
            {}, {'$pull': {'groups': DBRef(collection="groups", id=ObjectId(id))}})
        # mongo query for deleting specific id
        service = mongo.db.groups.delete_one({'_id': ObjectId(id)})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'group deleted successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# ______________________userReg____________________________
# adding role to user


@ app.route('/roleto_user', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
def roleto_user():
    _json = request.json
    _user_email = _json['user_email']
    _role_name = _json['role_name']

    existing_user = mongo.db.userReg.find_one({'email': _user_email})
    existing_role = mongo.db.roles.find_one({'name': _role_name})
    # check if user already has the Role
    if _user_email and existing_role:
        existing_roled = mongo.db.userReg.find_one(
            {'email': _user_email, 'roles': DBRef(collection="roles", id=existing_role['_id'])})
    if existing_user and existing_role and (existing_roled is None) and request.method == 'POST':
        # update user with new existing role
        mongo.db.userReg.update_one({'email': _user_email}, {
                                    '$push': {'roles': DBRef(collection="roles", id=existing_role['_id'])}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'role_to_user_added_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# adding existing group to userReg


@ app.route('/groupto_user', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
def groupto_user():
    _json = request.json
    _user_email = _json['user_email']
    _group_name = _json['group_name']

    existing_user = mongo.db.userReg.find_one({'email': _user_email})
    existing_group = mongo.db.groups.find_one({'name': _group_name})
    # check if user already has the group
    if existing_user and existing_group:
        existing_grouped = mongo.db.userReg.find_one(
            {'email': _user_email, 'groups': DBRef(collection="groups", id=existing_group['_id'])})
    if existing_user and existing_group and (existing_grouped is None) and request.method == 'POST':
        # update userReg with new existing group
        mongo.db.userReg.update_one({'email': _user_email}, {
                                    '$push': {'groups': DBRef(collection="groups", id=existing_group['_id'])}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Group_To_User_Added_Successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# remove targeted role from user


@ app.route('/rm_role_fromuser', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
def rm_role_fromuser():
    _json = request.json
    _user_email = _json['user_email']
    _role_name = _json['role_name']
    existing_user = mongo.db.userReg.find_one({'email': _user_email})
    existing_role = mongo.db.roles.find_one({'name': _role_name, })
    # check if userReg already has the role
    if _user_email and existing_role:
        existing_roled = mongo.db.userReg.find_one(
            {'email': _user_email, 'roles': DBRef(collection="roles", id=existing_role['_id'])})
    if existing_role and (existing_roled) and request.method == 'POST':
        # update userReg with pop the target existing role
        mongo.db.userReg.update_one({'email': _user_email, 'roles': DBRef(
            collection="roles", id=existing_role['_id'])}, {'$pop': {'roles': -1}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'rm_role_fromuser_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# remove targeted group from userReg


@ app.route('/rm_group_fromuser', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
def rm_group_fromuser():
    _json = request.json
    _user_email = _json['user_email']
    _group_name = _json['group_name']
    existing_user = mongo.db.userReg.find_one({'email': _user_email})
    existing_group = mongo.db.groups.find_one({'name': _group_name, })
    # check if user already has the group
    if _user_email and existing_group:
        existing_grouped = mongo.db.userReg.find_one(
            {'email': _user_email, 'groups': DBRef(collection="groups", id=existing_group['_id'])})
    if existing_group and (existing_grouped) and request.method == 'POST':
        # update userReg with pop the target existing group
        mongo.db.userReg.update_one({'email': _user_email, 'groups': DBRef(
            collection="groups", id=existing_group['_id'])}, {'$pop': {'groups': -1}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'rm_group_fromuser_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# Update user total service list(ts)


@ app.route('/update', methods=['POST', 'GET'])
def update():
    # _user_email=session['email']
    user = mongo.db.userReg.find_one({'email': session['email']})
    total = []
    # collect services from user groups
    for role in user['roles']:
        for service in mongo.db.dereference(role)["services"]:
            total.append(mongo.db.dereference(service))
    # collect services from user groups
    for group in user['groups']:
        for service in mongo.db.dereference(group)["services"]:
            total.append(mongo.db.dereference(service))
        for role in mongo.db.dereference(group)["roles"]:
            for service in mongo.db.dereference(role)["services"]:
                total.append(mongo.db.dereference(service))
    # remove duplicates using pandas
    ts = pd.DataFrame(total).drop_duplicates().to_dict('records')
    mongo.db.userReg.update_one(
        {'email': session['email']}, {"$set": {"ts": ts}})
    resp = dumps(ts)
    return resp
# .......role based end........................

# ..........friends start......................

# Get pending friend user


@app.route('/getPendFrUser', methods=['GET'])
@ cross_origin(supports_credentials=True)
@ token_required
def getPendFrUser():
    # mongo query for finding all value
    users = mongo.db.userReg.find({'emailconfirm': True})
    user = mongo.db.userReg.find_one(
        {'email': session['user']})
    # print(pend_fruser)
    # data = str(pend_fruser.get('friend_pending')[0].id)
    pending_friend = []
    if 'friend_pending' in user:
        # pend_fruser = dumps(pend_fruser['friend_pending'])
        pend_fruser = user['friend_pending']
        # print(pend_fruser)

        for us in users:
            # print('id in user ', us['_id'])
            for u in pend_fruser:
                # print(u.id)
                if u.id == us['_id']:
                    pending_friend.append(us)

    message = {
        'data': dumps(pending_friend),
        'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
    }
    return jsonify(message)


# Get the user's friend


@app.route('/getUserFriend', methods=['GET'])
@ cross_origin(supports_credentials=True)
@ token_required
def getUserFriend():
    # mongo query for finding all value
    users = mongo.db.userReg.find({'emailconfirm': True})
    user = mongo.db.userReg.find_one(
        {'email': session['user']})
    # print(pend_fruser)
    # data = str(pend_fruser.get('friend_pending')[0].id)
    user_friend = []
    if 'friends' in user:
        # pend_fruser = dumps(pend_fruser['friend_pending'])
        fruser = user['friends']
        # print(pend_fruser)

        for us in users:
            # print('id in user ', us['_id'])
            for u in fruser:
                # print(u.id)
                if u.id == us['_id']:
                    user_friend.append(us)

    message = {
        'data': dumps(user_friend),
        'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
    }
    return jsonify(message)

# Get the user's friend


@app.route('/getFriendSuggestion', methods=['GET'])
@ cross_origin(supports_credentials=True)
@ token_required
def getFriendSuggestion():
    # mongo query for finding all value
    users = mongo.db.userReg.find({'emailconfirm': True})
    user = mongo.db.userReg.find_one(
        {'email': session['user']})
    friend_suggestion = []

    # Remove own user for creating friend suggestion list
    for us in users:
        if user['_id'] != us['_id']:
            friend_suggestion.append(us)
    # print(friend_suggestion)
    # Remove user's pending friend for creating friend suggestion list
    temp_list = friend_suggestion[:]
    size_oflist = len(friend_suggestion)

    if 'friend_pending' in user:
        pend_fruser = user['friend_pending']
        for pf in temp_list[:]:
            for u in pend_fruser:
                if u.id == us['_id']:
                    if pf in friend_suggestion:
                        friend_suggestion.remove(pf)
    temp_list = friend_suggestion[:]
    size_oflist = len(friend_suggestion)

    # Remove user's friend for creating friend suggestion list
    if 'friends' in user:
        fruser = user['friends']
        for us in temp_list[:]:
            for u in fruser:
                if u.id == us['_id']:
                    if us in friend_suggestion:
                        friend_suggestion.remove(us)

    message = {
        'data': dumps(friend_suggestion),
        'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
    }
    return jsonify(message)


# adding existing friend to (existing)userReg
@ app.route('/friendReq/<id>', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
@ token_required
def friendReq(id):
    try:
        current_user = mongo.db.userReg.find_one({'email': session['user']})
        existing_user = mongo.db.userReg.find_one({'_id': ObjectId(id)})
        # check if userReg already has the friend
        existing_friend = mongo.db.userReg.find_one(
            {'email': session['user'], 'friends': DBRef(collection="userReg", id=ObjectId(id))})
        if existing_friend:
            # existing_friend = mongo.db.userReg.find_one({'email':session['email'], 'friends':DBRef(collection = "userReg", id = ObjectId(id) )  })
            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'Friend Already Exist', 'status': 200, }
            }
            return jsonify(message)
        if existing_user and (existing_user != current_user) and (existing_friend is None):
            # update userReg with new existing friend
            # mongo.db.userReg.update_one({'email':session['email'] },{ '$push': {'friend_pending': DBRef(collection = "userReg", id = ObjectId(id) ) } })
            _date = datetime.datetime.now()
            mongo.db.userReg.update_one({'_id': ObjectId(id)}, {'$set': {
                                        'isFrndReqAccepted': True
                                        }})
            mongo.db.userReg.update_one({'_id': ObjectId(id)}, {'$push': {
                                        'friend_pending': DBRef(collection="userReg", id=current_user['_id'])
                                        }})
            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'Friend Request Sent', 'status': 200, }
            }
            # for json response
            return jsonify(message)
        else:
            return not_found()
    except Exception as e:
        print('Error ', e)
        return internal_error()

# Cancel Friend Request


@ app.route('/cancelFrndReq/<id>', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
@ token_required
def cancelFrndReq(id):
    try:
        print('id = ', id)
        # print('User ', session['user'])
        current_user = mongo.db.userReg.find_one({'email': session['user']})
        # existing_user = mongo.db.userReg.find_one({'_id': ObjectId(id)})
        pending_friend = mongo.db.userReg.find_one(
            {'_id': ObjectId(id), 'friend_pending': DBRef(collection="userReg", id=current_user['_id'])})
        # print('Pending frined ', pending_friend)
        if pending_friend:
            mongo.db.userReg.update_one({'_id': ObjectId(id)}, {'$set': {
                                        'isFrndReqAccepted': False
                                        }})
            mongo.db.userReg.update_one({'_id': ObjectId(id)}, {'$pull': {'friend_pending': DBRef(
                collection="userReg", id=current_user['_id'])}})

            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'Friend Request Canceled', 'status': 200, }
            }
            return jsonify(message)
        else:
            return not_found()
    except:
        return internal_error()
# acceptFriend Request


@ app.route('/friendReqAccept/<id>', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
@ token_required
def acceptFriendReq(id):
    try:
        current_user = mongo.db.userReg.find_one({'email': session['user']})
        pending_friend = mongo.db.userReg.find_one(
            {'email': session['user'], 'friend_pending': DBRef(collection="userReg", id=ObjectId(id))})

        if pending_friend:
            mongo.db.userReg.update_one({'email': session['user']}, {'$set': {
                                        'isFrndReqAccepted': False
                                        }})
            # adding in both users friend list
            mongo.db.userReg.update_one({'email': session['user']}, {
                                        '$push': {'friends': DBRef(collection="userReg", id=ObjectId(id))}})
            mongo.db.userReg.update_one({'_id': ObjectId(id)}, {
                                        '$push': {'friends': DBRef(collection="userReg", id=current_user['_id'])}})
            mongo.db.userReg.update_one({'email': session['user']}, {'$pull': {'friend_pending': DBRef(
                collection="userReg", id=ObjectId(id))}})
            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'Friend Request Accepted', 'status': 200, }
            }
            return jsonify(message)
        else:
            return not_found()
    except:
        return internal_error()

# deleteFriend Request


@ app.route('/friendReqDel/<id>', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
@ token_required
def friendReqDel(id):
    try:
        current_user = mongo.db.userReg.find_one({'email': session['user']})
        pending_friend = mongo.db.userReg.find_one(
            {'email': session['user'], 'friend_pending': DBRef(collection="userReg", id=ObjectId(id))})

        if pending_friend:
            mongo.db.userReg.update_one({'email': session['user']}, {'$set': {
                                        'isFrndReqAccepted': False
                                        }})
            mongo.db.userReg.update_one({'email': session['user']}, {'$pull': {'friend_pending': DBRef(
                collection="userReg", id=ObjectId(id))}})
            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'Friend Request Declined', 'status': 200, }
            }
            return jsonify(message)
        else:
            return not_found()
    except:
        return internal_error()


# remove targeted friend from userReg
@ app.route('/rmFriend/<id>', methods=['POST', 'GET'])
@ cross_origin(supports_credentials=True)
@ token_required
def rmFriend(id):
    try:
        current_user = mongo.db.userReg.find_one({'email': session['user']})

        existing_user = mongo.db.userReg.find_one({'_id': ObjectId(id)})
        # print('ID = ', id)
        # print('Current user = ', current_user)
        # print('Existing user ', existing_user)
        # check if userReg already has the friend
        if existing_user:
            existing_friend = mongo.db.userReg.find_one(
                {'email': session['user'], 'friends': DBRef(collection="userReg", id=ObjectId(id))})
            # print(existing_friend)
            if existing_friend is None:
                message = {
                    'data': "null",
                    'result': {'isError': 'false', 'message': 'User not found in your friend list', 'status': 200, }
                }
                # for json response
                return jsonify(message)
        if existing_user and (existing_friend):
            # update userReg with pop the target existing friend
            mongo.db.userReg.update_one({'email': session['user']}, {'$pull': {'friends':  DBRef(
                collection="userReg", id=ObjectId(id))}})
            mongo.db.userReg.update_one({'_id': ObjectId(id)}, {'$pull': {'friends':  DBRef(
                collection="userReg", id=current_user['_id'])}})
            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'Removed from friend list', 'status': 200, }
            }
            # for json response
            return jsonify(message)
        else:
            return not_found()
    except Exception as e:
        print('Error in remove ', e)
        return internal_error()

# ................friends end..........................


if __name__ == "__main__":
    app.run(debug=True)
    # app.run(host='188.166.178.99', port=5000, debug=True)
