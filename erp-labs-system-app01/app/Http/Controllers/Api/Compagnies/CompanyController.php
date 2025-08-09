<?php

namespace App\Http\Controllers\Api\Compagnies;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\UpdateCompanyRequest;
use App\Models\Company;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    public function updateMyCompany(UpdateCompanyRequest $request)
    {
        $user = $request->user();
        $company = Company::findOrFail($user->company_id);

        $data = $request->validated();
        $payload = [];
        foreach (['nom_company','adresse','email','contact','secteur_activite','type_etablissement','description'] as $f) {
            if ($request->has($f)) { $payload[$f] = $request->input($f); }
        }

        if (($data['remove_logo'] ?? false) === true) {
            if ($company->logo && Storage::disk('public')->exists($company->logo)) {
                Storage::disk('public')->delete($company->logo);
            }
            $payload['logo'] = null;
        } elseif ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('companies', 'public');
            if ($company->logo && Storage::disk('public')->exists($company->logo)) {
                Storage::disk('public')->delete($company->logo);
            }
            $payload['logo'] = $path;
        }

        $company->fill($payload)->save();

        return ApiResponse::success($company->fresh(), 'company.updated');
    }
}


