import jsonwebtoken from 'jsonwebtoken';
import Controller from './controller.js';
import Service from '../services/collaborator.js';
import HttpResponses from '../utils/http_responses.js';
import { catchAsync } from '../utils/catch_async.js';
import { config } from '../../config.js';
class CollaboratorController extends Controller {
    constructor() {
        super('collaborator');
        this.login = catchAsync(this.login.bind(this));
        this.service = Service;
        this.logout = catchAsync(this.logout.bind(this));
        this.verifyEmail = catchAsync(this.verifyEmail.bind(this));
        this.requestRecoveryCode = catchAsync(this.requestRecoveryCode.bind(this));
        this.verifyRecoveryCode = catchAsync(this.verifyRecoveryCode.bind(this));
        this.resetPassword = catchAsync(this.resetPassword.bind(this));
    }
    async login(req, res) {
        const { email, password } = req.body;
        const sessionToken = await this.service.authenticate(email, password);
        res.cookie('auth', sessionToken);
        return HttpResponses.ok(res, null, 'login successful');
    }
    async logout(req, res) {
        res.clearCookie('auth');
        return HttpResponses.ok(res, null, 'logout successful');
    }
    async post(req, res) {
        const token = await this.service.prepareRegistration(req.body);
        res.cookie('sc_verification', token, { maxAge: 15 * 60 * 1000 });
        return HttpResponses.ok(res, null, 'verification email sent');
    }
    async verifyEmail(req, res) {
        const { code } = req.body;
        const token = req.cookies.sc_verification;
        if (!token) return HttpResponses.badRequest(res, 'session expired');
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (code !== decoded.code) return HttpResponses.badRequest(res, 'invalid code');
        await this.service.completeRegistration(decoded);
        res.clearCookie('sc_verification');
        return HttpResponses.created(res, null, 'registration complete');
    }
    async requestRecoveryCode(req, res) {
        const { email } = req.body;
        const { token } = await this.service.prepareRecovery(email);
        res.cookie('sc_recovery', token, { maxAge: 15 * 60 * 1000 });
        return HttpResponses.ok(res, null, 'recovery email sent');
    }
    async verifyRecoveryCode(req, res) {
        const { code } = req.body;
        const token = req.cookies.sc_recovery;
        if (!token) return HttpResponses.badRequest(res, 'session expired');
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (code !== decoded.code) return HttpResponses.badRequest(res, 'incorrect confirmation code');
        const newToken = await this.service.completeRecovery(token, code);
        res.cookie('sc_recovery', newToken, { maxAge: 15 * 60 * 1000 });
        return HttpResponses.ok(res, null, 'code verified successfully. You can now change your password');
    }
    async resetPassword(req, res) {
        const { newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) return HttpResponses.badRequest(res, 'passwords do not match');
        const token = req.cookies.sc_recovery;
        if (!token) return HttpResponses.badRequest(res, 'session expired');
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (!decoded.isVerified) return HttpResponses.forbidden(res, 'account not verified. Try again later');
        await this.service.resetPassword(decoded.email, newPassword);
        res.clearCookie('sc_recovery');
        return HttpResponses.ok(res, null, 'password changed successfully :)))');
    }
}
export default new CollaboratorController();