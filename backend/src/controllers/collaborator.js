import jsonwebtoken from 'jsonwebtoken';
import Controller from './controller.js';
import Service from '../services/collaborator.js';
import HttpResponses from '../utils/http_responses.js';
import { catchAsync } from '../utils/catch_async.js';
import { config } from '../../config.js';
import AuthenticationError from '../errors/authentication.js';
import AuthorizationError from '../errors/authorization.js';
class CollaboratorController extends Controller {
    constructor() {
        super('collaborator');
        this.service = Service;
        this.login = catchAsync(this.login.bind(this));
        this.logout = catchAsync(this.logout.bind(this));
        this.completeInvitation = catchAsync(this.completeInvitation.bind(this));
        this.requestRecoveryCode = catchAsync(this.requestRecoveryCode.bind(this));
        this.verifyRecoveryCode = catchAsync(this.verifyRecoveryCode.bind(this));
        this.resetPassword = catchAsync(this.resetPassword.bind(this));
        this.uploadPicture = catchAsync(this.uploadPicture.bind(this));
    }
    async login(req, res) {
        const { email, password } = req.body;
        const { token, collaborator } = await this.service.authenticate(email, password);
        res.cookie('auth', token);
        return HttpResponses.ok(res, { collaborator }, 'login successful');
    }
    async logout(req, res) {
        res.clearCookie('auth');
        return HttpResponses.ok(res, null, 'logout successful');
    }
    async post(req, res) {
        const collaborator = await this.service.create(req.body, { file: req.file });
        await this.service.afterCreate(collaborator);
        return HttpResponses.created(res, collaborator, 'invitation sent successfully');
    }
    async completeInvitation(req, res) {
        const { token, code, password, confirmPassword } = req.body;
        if (password !== confirmPassword) return HttpResponses.badRequest(res, 'passwords do not match');
        await this.service.completeInvitation(token, code, password);
        return HttpResponses.ok(res, null, 'account completed successfully');
    }
    async requestRecoveryCode(req, res) {
        const { email } = req.body;
        const token = await this.service.prepareRecovery(email);
        res.cookie('a_recovery', token, { maxAge: 15 * 60 * 1000 });
        return HttpResponses.ok(res, null, 'recovery email sent');
    }
    async verifyRecoveryCode(req, res) {
        const { code } = req.body;
        const token = req.cookies.a_recovery;
        if (!token) throw new AuthenticationError('session expired');
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (code !== decoded.code) throw new AuthorizationError('incorrect code');
        const newToken = await this.service.completeRecovery(token, code);
        res.cookie('a_recovery', newToken, { maxAge: 15 * 60 * 1000 });
        return HttpResponses.ok(res, null, 'code verified successfully');
    }
    async resetPassword(req, res) {
        const { newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) return HttpResponses.badRequest(res, 'passwords do not match');
        const token = req.cookies.a_recovery;
        if (!token) throw new AuthenticationError('session expired');
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (!decoded.verified_email) throw new AuthorizationError('account not verified');
        await this.service.resetPassword(
            decoded.email,
            newPassword
        );
        res.clearCookie('a_recovery');
        return HttpResponses.ok(res, null, 'password changed successfully');
    }
    async uploadPicture(req, res) {
        const collaborator = await this.service.uploadPicture(
            req.params.id,
            req.file
        );
        return HttpResponses.ok(res, collaborator, 'picture updated successfully');
    }
}
export default new CollaboratorController();